from pypdf import PdfReader
from .chroma_db import get_chroma_collection
import fitz

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def save_chunks_to_chromadb(document, chunks):
    model = get_embedding_model()
    collection = get_chroma_collection()
    for index, chunk in enumerate(chunks):

        embedding = model.encode(chunk).tolist()

        collection.add(
            ids=[f"{document.id}_{index}"],
            embeddings=[embedding],
            documents=[chunk],
            metadatas=[
                {
                    "document_id": document.id,
                    "chunk_index": index
                }
            ]
        )


def extract_pdf_text(pdf_path):

    doc = fitz.open(pdf_path)

    text = ""

    for page in doc:
        text += page.get_text("text")

    return text
 

def create_chunks(text, chunk_size=800, overlap=150):
    # Split by double newlines first (paragraphs)
    paragraphs = text.split("\n\n")
    cleaned_paragraphs = []
    
    for p in paragraphs:
        # Join lines that were split by single newlines (line wraps in PDFs)
        p_cleaned = " ".join(line.strip() for line in p.split("\n") if line.strip())
        if len(p_cleaned) > 10:
            cleaned_paragraphs.append(p_cleaned)
            
    chunks = []
    current_chunk = ""
    
    for p in cleaned_paragraphs:
        if len(current_chunk) + len(p) + 1 <= chunk_size:
            if current_chunk:
                current_chunk += " " + p
            else:
                current_chunk = p
        else:
            if current_chunk:
                chunks.append(current_chunk)
            
            # If a single paragraph is longer than chunk_size, split it
            if len(p) > chunk_size:
                start = 0
                while start < len(p):
                    end = start + chunk_size
                    chunks.append(p[start:end])
                    start += chunk_size - overlap
                current_chunk = ""
            else:
                current_chunk = p
                
    if current_chunk:
        chunks.append(current_chunk)
        
    return chunks


def search_chunks(query, top_k=10, user_doc_ids=None):
    """
    Search relevant chunks from ChromaDB
    """

    print("\n" + "=" * 60)
    print("QUERY:", query)
    print("USER DOC IDS:", user_doc_ids)
    print("=" * 60 + "\n")

    if user_doc_ids is not None:
        if not user_doc_ids:
            print("No document IDs found!")
            return {"documents": [[]]}

        if len(user_doc_ids) == 1:
            where_clause = {"document_id": user_doc_ids[0]}
        else:
            where_clause = {"document_id": {"$in": user_doc_ids}}
    else:
        where_clause = None

    print("WHERE CLAUSE:", where_clause)

    model = get_embedding_model()
    embedding = model.encode(query).tolist()

    collection = get_chroma_collection()
    results = collection.query(
        query_embeddings=[embedding],
        n_results=top_k,
        where=where_clause
    )

    print("\n===== RETRIEVED DOCUMENTS =====\n")

    if results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            print(f"\n----- DOCUMENT {i+1} -----\n")
            print(doc[:1000])
            print("\n" + "-" * 50)
    else:
        print("No documents retrieved!")

    print("\n===== END RETRIEVED DOCUMENTS =====\n")

    return results


def delete_document_from_chromadb(document_id):
    """
    Delete document chunks from ChromaDB
    """
    try:
        collection = get_chroma_collection()
        collection.delete(where={"document_id": document_id})
    except Exception as e:
        print(f"Error deleting document {document_id} from ChromaDB: {e}")
