from pathlib import Path
from typing import Iterable


def safe_delete_file(file_path: str | Path) -> bool:
    """
    Delete a temporary file safely.

    Returns True when the file was deleted or did not exist.
    Returns False when deletion failed.
    """
    path = Path(file_path)

    if not path.exists():
        return True

    try:
        path.unlink()
        return True
    except OSError:
        return False


def safe_delete_files(
    file_paths: Iterable[str | Path],
) -> int:
    """
    Delete multiple temporary files.

    Returns the number of files successfully removed.
    """
    deleted_count = 0

    for file_path in file_paths:
        if safe_delete_file(file_path):
            deleted_count += 1

    return deleted_count