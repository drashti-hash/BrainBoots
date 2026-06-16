import sys

_collection = None

def get_chroma_collection():
    global _collection
    if _collection is None:
        import chromadb
        try:
            client = chromadb.PersistentClient(path="./chroma_db")
            _collection = client.get_or_create_collection(
                name="documents"
            )
        except Exception as e:
            print(f"[CHROMA_ERROR] Failed to initialize ChromaDB: {e}", file=sys.stderr)
            raise e
    return _collection

