let activeNoteId: string = "";
export interface Note {
  id: string;
  content: string;
  date: string;
}

export function saveNote(note: Note): Note {
  if (!activeNoteId || activeNoteId.length === 0) {
    note.id = `note_${new Date().getTime()}`;
    activeNoteId = note.id;
  } else {
    note.id = activeNoteId;
  }
  localStorage.setItem(note.id, JSON.stringify(note));
  displaySavedNotes();
  return note;
}

export function fetchNote(noteId: string) {
    const noteDataJSON = localStorage.getItem(noteId);
    if (noteDataJSON) {
        const noteData = JSON.parse(noteDataJSON);
        console.log('Note:', noteData.content, 'Date:', noteData.date);
        // Use noteData.content and noteData.date as needed
    } else {
        console.log('Note note found');
    }
}

export function deleteNote(noteId: string): void {
  localStorage.removeItem(noteId);
  displaySavedNotes(); // Refresh the list of displayed notes
}

export function displaySavedNotes(): void {
  const savedNotesContainer = document.getElementById('saved-notes-container');
  const editor = document.getElementById('markdown-input'); // Assuming this is your editor's ID
  if (!savedNotesContainer || !editor) return;

  let notes = [];
  for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('note_')) {
          const noteDataJSON = localStorage.getItem(key);
          if (noteDataJSON) {
              const noteData = JSON.parse(noteDataJSON);
              notes.push({ key, ...noteData });
          }
      }
  }

  notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  savedNotesContainer.innerHTML = '';

  notes.forEach(note => {
      const noteDate = new Date(note.date);
      const formattedDate = `${noteDate.getDate()}/${noteDate.getMonth() + 1}/${noteDate.getFullYear()}`;
      let noteContentPreview = note.content.split('\n')[0];
      noteContentPreview = noteContentPreview.replace(/<[^>]*>/g, ' ').substring(0, 40);

      const noteElement = document.createElement('div');
      noteElement.classList.add('saved-note');
      noteElement.innerHTML = `
          <div class="note-content">${noteContentPreview}...</div>
          <div class="note-date">${formattedDate}</div>
      `;
      noteElement.setAttribute('role', 'button');
      noteElement.tabIndex = 0;
      noteElement.setAttribute('aria-label', `Note: ${noteContentPreview}`);

      noteElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            editor.innerHTML = note.content; // Load the full note content into the editor
            activeNoteId = note.id; // Update the activeNoteId with the clicked note's ID
        }
      });

      // Create a container for the SVG icon
      const deleteIconContainer = document.createElement('div');
      deleteIconContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="delete-note-icon" aria-label="Delete note" role="button" tabindex="0" style="width: 20px; height: 20px; fill: currentColor; cursor: pointer;">
          <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
      </svg>
      `;
      
      // Set up the click event listener on the container to handle the delete action
      const svgElement = deleteIconContainer.querySelector('svg');
      if (svgElement) {
          svgElement.addEventListener('click', (event) => {
              event.stopPropagation(); // Prevent the click from affecting parent elements
              deleteNote(note.id);

              if (activeNoteId === note.id) {
                  const editor = document.getElementById('markdown-input');
                  if (editor) {
                      editor.innerHTML = '';
                  }
                  activeNoteId = ""; 
              }
          });
      }

      // Append the delete icon container to the note element
      noteElement.appendChild(deleteIconContainer);
      savedNotesContainer.appendChild(noteElement);

      // Add click event listener to load the note content into the editor
      noteElement.addEventListener('click', () => {
          editor.innerHTML = note.content; // Load the full note content into the editor
          activeNoteId = note.id; // Update the activeNoteId with the clicked note's ID
      });
  });
}
