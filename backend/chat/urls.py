from django.urls import path
from .views import (
    ChatAPIView, ChatHistoryAPIView, CreateSessionAPIView, DeleteDocumentAPIView,
    DocumentListAPIView, DocumentSearchAPIView, DocumentUploadAPIView,
    SessionListAPIView, SessionMessagesAPIView, TestAPI, ChatStreamAPIView,
    DeleteSessionAPIView
)

urlpatterns = [
    path("session/create/", CreateSessionAPIView.as_view(), name="create_session"),
    path("ask/", ChatAPIView.as_view(), name="ask_ai"),
    path("history/", ChatHistoryAPIView.as_view(), name="chat_history"),
    path("chat/stream/", ChatStreamAPIView.as_view()),
    path("sessions/", SessionListAPIView.as_view()),
    path("sessions/<int:session_id>/messages/", SessionMessagesAPIView.as_view()),
    path("sessions/<int:session_id>/delete/", DeleteSessionAPIView.as_view(), name="delete_session"),
    path("test/", TestAPI.as_view()),

    path("documents/upload/", DocumentUploadAPIView.as_view()),
    path("documents/", DocumentListAPIView.as_view()),
    path("documents/<int:document_id>/delete/", DeleteDocumentAPIView.as_view()),
    path("documents/search/", DocumentSearchAPIView.as_view()),
]
