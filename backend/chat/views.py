from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .auth_backend import BrainbootsJWTAuthentication

from .models import ChatSession, Message
from .services import ask_ai, ask_ai_stream

from .models import Document , DocumentChunk
from .serializers import DocumentSerializer
from .utils import extract_pdf_text, create_chunks, save_chunks_to_chromadb, search_chunks, delete_document_from_chromadb
from .rag_service import generate_rag_response


def is_simple_greeting(text):
    greetings = {"hi", "hello", "hey", "hola", "greetings", "good morning", "good afternoon", "good evening", "howdy", "yo"}
    clean_text = text.strip().lower().replace("?", "").replace("!", "")
    return clean_text in greetings or len(clean_text) < 3

# =========================
# CREATE SESSION
# =========================
class CreateSessionAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        session = ChatSession.objects.create(
            user=request.user
        )

        return Response({
            "session_id": session.id
        }, status=status.HTTP_201_CREATED)


# =========================
# NORMAL CHAT (NON-STREAM)
# =========================
class ChatAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        prompt = request.data.get("prompt")
        session_id = request.data.get("session_id")

        if not prompt:
            return Response(
                {"error": "prompt is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # session validation
        if session_id:
            try:
                session = ChatSession.objects.get(
                    id=session_id,
                    user=request.user
                )
            except ChatSession.DoesNotExist:
                return Response(
                    {"error": "Invalid session"},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            session = ChatSession.objects.create(user=request.user)

        # memory (last 10 messages) before saving user message
        previous_messages = Message.objects.filter(
            session=session
        ).order_by("-created_at")[:10]

        previous_messages = reversed(previous_messages)

        history_str = ""
        for msg in previous_messages:
            if msg.role == "user":
                history_str += f"User: {msg.content}\n"
            else:
                history_str += f"Assistant: {msg.content}\n"

        # save user message
        Message.objects.create(
            session=session,
            role="user",
            content=prompt
        )

        full_prompt = history_str + f"User: {prompt}\nAssistant:"

        # RAG Search
        document_id = request.data.get("document_id")
        context = ""

        if not is_simple_greeting(prompt):
            user_doc_ids = []
            if document_id:
                if Document.objects.filter(id=document_id).exists():
                    user_doc_ids = [document_id]
            else:
                user_doc_ids = list(Document.objects.all().values_list('id', flat=True))

            if user_doc_ids:
                results = search_chunks(
                    query=prompt,
                    top_k=3,
                    user_doc_ids=user_doc_ids
                )
                documents = results.get("documents", [])
                if documents and documents[0]:
                    context = "\n\n".join(documents[0])

        if context:
            # We construct a RAG prompt that also includes history for consistency!
            history_section = f"\nConversation History:\n{history_str}" if history_str else ""
            llm_prompt = f"""You are a Brainboot AI Assistant.
Use the provided context to answer.

Rules:
1. Answer only from the context if possible, but also pay attention to the flow of the conversation history.
2. If the answer is not found in the context and cannot be inferred, use your general knowledge, but prioritize the provided context.

Context:
{context}
{history_section}
User: {prompt}
Assistant:"""
            answer = ask_ai(llm_prompt)
        else:
            # Fallback to standard chat memory
            answer = ask_ai(full_prompt)

        # save bot message
        Message.objects.create(
            session=session,
            role="bot",
            content=answer
        )

        return Response({
            "session_id": session.id,
            "question": prompt,
            "answer": answer
        })


# =========================
# 🔥 STREAMING CHAT
# =========================
class ChatStreamAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        prompt = request.data.get("prompt")
        session_id = request.data.get("session_id")
        message_id = request.data.get("message_id")

        if not prompt:
            return Response(
                {"error": "prompt is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = ChatSession.objects.get(
                id=session_id,
                user=request.user
            )
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Invalid session"},
                status=status.HTTP_404_NOT_FOUND
            )

        edited_message = None
        if message_id:
            try:
                edited_message = Message.objects.get(
                    id=message_id,
                    session=session,
                    role="user"
                )
                edited_message.content = prompt
                edited_message.save()
                # Delete all subsequent messages in this session
                Message.objects.filter(
                    session=session,
                    created_at__gt=edited_message.created_at
                ).delete()
            except Message.DoesNotExist:
                return Response(
                    {"error": "Message to edit not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        # memory (last 10 messages) before saving user message (or before edited message)
        if edited_message:
            history = Message.objects.filter(
                session=session,
                created_at__lt=edited_message.created_at
            ).order_by("-created_at")[:10]
        else:
            history = Message.objects.filter(
                session=session
            ).order_by("-created_at")[:10]

        history = reversed(history)

        history_str = ""
        for msg in history:
            if msg.role == "user":
                history_str += f"User: {msg.content}\n"
            else:
                history_str += f"Assistant: {msg.content}\n"

        if not edited_message:
            # save user message
            Message.objects.create(
                session=session,
                role="user",
                content=prompt
            )

        full_prompt = history_str + f"User: {prompt}\nAssistant:"

        # RAG Search
        document_id = request.data.get("document_id")
        context = ""

        if not is_simple_greeting(prompt):
            user_doc_ids = []
            if document_id:
                if Document.objects.filter(id=document_id).exists():
                    user_doc_ids = [document_id]
            else:
                user_doc_ids = list(Document.objects.all().values_list('id', flat=True))

            if user_doc_ids:
                try:
                    results = search_chunks(
                        query=prompt,
                        top_k=3,
                        user_doc_ids=user_doc_ids
                    )
                    documents = results.get("documents", [])
                    if documents and documents[0]:
                        context = "\n\n".join(documents[0])
                except Exception as e:
                    print(f"Error searching chunks: {e}")

        # Choose the prompt based on context presence
        if context:
            history_section = f"\nConversation History:\n{history_str}" if history_str else ""
            llm_prompt = f"""You are a helpful AI assistant. Use the following context from the user's uploaded documents to answer the question if relevant. If the context is not relevant or does not contain the answer, answer the question using your general knowledge.

Context:
{context}
{history_section}
User: {prompt}
Assistant:"""
        else:
            llm_prompt = full_prompt

        # streaming generator
        def event_stream():
            full_response = ""
            try:
                for chunk in ask_ai_stream(llm_prompt):
                    full_response += chunk
                    yield chunk  # send token to frontend instantly
            finally:
                if full_response:
                    from django.db import close_old_connections
                    close_old_connections()
                    Message.objects.create(
                        session=session,
                        role="bot",
                        content=full_response
                    )

        response = StreamingHttpResponse(
            event_stream(),
            content_type="text/plain"
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response


# =========================
# CHAT HISTORY
# =========================
class ChatHistoryAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        messages = Message.objects.filter(
            session__user=request.user
        ).order_by("-created_at")

        data = []

        for msg in messages:
            data.append({
                "id": msg.id,
                "session_id": msg.session.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at
            })

        return Response(data)
    
class SessionListAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        sessions = ChatSession.objects.filter(
            user=request.user
        ).order_by("-created_at")

        data = []

        for session in sessions:

            first_message = Message.objects.filter(
                session=session,
                role="user"
            ).first()

            data.append({
                "id": session.id,
                "title": first_message.content[:40]
                if first_message
                else "New Chat"
            })

        return Response(data)
    

class SessionMessagesAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):

        messages = Message.objects.filter(
            session_id=session_id,
            session__user=request.user
        ).order_by("created_at")

        return Response([
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at
            }
            for m in messages
        ])


class DeleteSessionAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            session.delete()
            return Response({"message": "Session deleted successfully"}, status=status.HTTP_200_OK)
        except ChatSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

class DocumentUploadAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response(
                {"error": "PDF file is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            # Save document
            document = Document.objects.create(
                user=request.user,
                file=file
            )

            # Extract text from PDF
            pdf_text = extract_pdf_text(
                document.file.path
            )

            # Create chunks
            chunks = create_chunks(pdf_text)

            # Save chunks in database
            for index, chunk in enumerate(chunks):

                DocumentChunk.objects.create(
                    document=document,
                    chunk_text=chunk,
                    chunk_index=index
                )

            save_chunks_to_chromadb(
                document,
                chunks
            )

            return Response(
                {
                    "message": "Document uploaded successfully",
                    "document": DocumentSerializer(document).data,
                    "text_length": len(pdf_text),
                    "chunks_created": len(chunks)
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class DocumentListAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        documents = Document.objects.all().order_by("-uploaded_at")

        serializer = DocumentSerializer(
            documents,
            many=True
        )

        return Response(serializer.data)
    
class DeleteDocumentAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, document_id):

        try:

            document = Document.objects.get(
                id=document_id
            )

            # Delete vector embeddings from ChromaDB
            delete_document_from_chromadb(document.id)

            # Delete physical file from disk
            import os
            try:
                if document.file and os.path.exists(document.file.path):
                    os.remove(document.file.path)
            except Exception as e:
                print(f"Error removing physical file: {e}")

            document.delete()

            return Response(
                {"message": "Document deleted successfully"}
            )

        except Document.DoesNotExist:

            return Response(
                {"error": "Document not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
class DocumentSearchAPIView(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        query = request.data.get("query", "").strip()

        if not query:
            return Response(
                {"error": "Query is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            # Search top chunks from ChromaDB
            results = search_chunks(
                query=query,
                top_k=10
            )

            documents = results.get("documents", [])

            if not documents or len(documents[0]) == 0:
                return Response(
                    {
                        "query": query,
                        "answer": "No relevant information found in uploaded documents."
                    },
                    status=status.HTTP_200_OK
                )

            # Combine retrieved chunks
            context = "\n\n".join(documents[0])

            # Generate answer using Phi-3
            answer = generate_rag_response(
                query=query,
                context=context
            )

            return Response(
                {
                    "query": query,
                    "answer": answer,
                    "context": context
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
# =========================
# TEST API
# =========================
class TestAPI(APIView):
    authentication_classes = [BrainbootsJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "Logged in user",
            "user": request.user.username
        })
