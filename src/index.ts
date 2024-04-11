import showdown from 'showdown';
import Holidays from 'date-holidays';
import type { Note } from './noteStorage';
import { saveNote, displaySavedNotes } from './noteStorage';
import { startSpeechToText, createVikingPipeline, stopSpeechToText } from './speechUtils';

let activeNoteId: string = "";
let currentNote: Note;

document.addEventListener('DOMContentLoaded', function() {
    let converter = new showdown.Converter();
    let inputDiv = document.getElementById('markdown-input');
    displaySavedNotes();
    displayCustomLogo();

    if (inputDiv) { // Perform the null check here
        var lastWorkdayText = document.getElementById('last-workday-text');
        if(lastWorkdayText) {
            if (isTodayLastWorkdayOfMonth()) {
                lastWorkdayText.textContent = 'Last day of the month, don\'t forget to <a  target="_blank" href="https://academicwork.flexhosting.se/HRM">save your time report</a> ;)';
            } else if (new Date().getDay() === 5) {
                lastWorkdayText.textContent = 'Don\'t forget to <a  target="_blank" href="https://academicwork.flexhosting.se/HRM">time report</a> ;)';
            } else {
                lastWorkdayText.textContent = 'A beautiful day for taking notes';
            }    
        }
        
        inputDiv.addEventListener('keydown', function(event: KeyboardEvent) {
            handleKeyDown(event, inputDiv as HTMLElement, converter); // Pass inputDiv and converter as arguments
        });
    }
});

document.getElementById('logo')?.addEventListener('click', function() {
    document.getElementById('imageUpload')?.click();
});

document.getElementById('logo')?.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        document.getElementById('imageUpload')?.click();
    }
});

document.getElementById('imageUpload')?.addEventListener('change', function(event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (e.target && e.target.result) {
                    localStorage.setItem('customLogo', e.target.result.toString());
                    const logoImg = document.getElementById('logo');
                    if (logoImg) {
                        (logoImg as HTMLImageElement).src = e.target.result.toString();
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    }
});

async function displayRecordedText(text: string) {
    const markdownInputContainer = document.getElementById('markdown-input-container');
    if (!markdownInputContainer) {
        console.error('Markdown input container not found');
        return;
    }

    // Display the recorded text
    markdownInputContainer.textContent = text;

    // Send the text to Viking-7B pipeline and display the response
    const vikingPipeline = await createVikingPipeline();
    const response = await vikingPipeline(text);
    const generatedText = response[0] //.generated_text; // Assuming the response structure, adjust as needed
    console.log(generatedText);
    // Append the generated text to the container
    markdownInputContainer.textContent += `\n\nGenerated Response:\n${generatedText}`;
}

document.getElementById('record-btn')?.addEventListener('click', () => {
    startSpeechToText(displayRecordedText, updateRecordingButton);    
});

document.getElementById('stop-record-btn')?.addEventListener('click', () => {
    stopSpeechToText(updateRecordingButton);
});

function updateRecordingButton(isRecording: boolean) {
    const recordBtn = document.getElementById('record-btn');
    const stopRecordBtn = document.getElementById('stop-record-btn');
    if (!recordBtn || !stopRecordBtn) return;

    if (isRecording) {
        stopRecordBtn.style.display = 'inline-block'; // Show the "Stop Recording" button
        recordBtn.style.display = 'none'; // Hide the "Record" button
    } else {
        stopRecordBtn.style.display = 'none'; // Hide the "Stop Recording" button
        recordBtn.style.display = 'inline-block'; // Show the "Record" button
    }
}

const handleKeyDown = (
    event: KeyboardEvent,
    inputDiv: HTMLElement,
    converter: showdown.Converter
  ): void => {
      if (event.key === "Enter") {
          event.preventDefault(); // Still prevent the default Enter behavior
          let isBulletList = false;
          
          let lines = inputDiv.innerHTML.split(/<\/div><div>|<br>|<\/div>|<div>/g);
          let currentLine = lines[lines.length - 1];
          let isCursorAtEnd = isCursorAtTheEnd(currentLine);
          
          if (!isCursorAtEnd)
              inputDiv.innerHTML += "<div><br></div>"; // Add a line break
          
          let newContent = lines.map(line => {
              let textOnly = line.replace(/<[^>]*>/g, '');
              currentLine = lines[lines.length - 2];
              isBulletList = currentLine?.trim().startsWith("* ");
              if (isMarkdown(textOnly)) {
                  return converter.makeHtml(textOnly);
              } else if (line.match(/<\/?[^>]+(>|$)/)) {
                  return line;
              } else {
                  return converter.makeHtml(textOnly);
              }
          }).join('');
          
          inputDiv.innerHTML = newContent;
        
          const note = {
              id: activeNoteId,
              content: inputDiv.innerHTML,
              date: new Date().toISOString()
          };
          currentNote = saveNote(note);
          insertNewLine(inputDiv, isBulletList);
          placeCaretAtEnd(inputDiv);
      }
  };

const isTodayLastWorkdayOfMonth = () => {
    const holidays = new Holidays('SE');
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const swedishHolidays = holidays.getHolidays(year);
    
    // Function to check if a given day is a holiday
    const isHoliday = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0];
        return swedishHolidays.some(holiday => holiday.date === formattedDate);
    };
    // Function to check if a given day is a weekend (Saturday or Sunday)
    const isWeekend = (date: Date) => {
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    };
    // Check if today is the last workday by looking ahead to see if the remaining days are holidays or weekends
    let tempDate = new Date(currentDate);
    tempDate.setDate(tempDate.getDate() + 1); // Start checking from tomorrow
    const lastDayOfMonth = new Date(year, month + 1, 0); // Last day of the current month

    while (tempDate <= lastDayOfMonth) {
        if (!isHoliday(tempDate) && !isWeekend(tempDate)) {
            // Found a day that is not a holiday or weekend before the month ends
            return false;
        }
        tempDate.setDate(tempDate.getDate() + 1); // Move to the next day
    }
    // If we reach this point, it means all remaining days are either holidays or weekends
    return true;
};

const displayCustomLogo = () => {
    const customLogo = localStorage.getItem('customLogo');
    const logoImg = document.getElementById('logo');
    if (customLogo && logoImg) {
        (logoImg as HTMLImageElement).src = customLogo;
    }
    if (logoImg) {
        logoImg.style.display = 'block';
    }
}

const isMarkdown = (text: string): boolean => {
    const markdownPatterns = [/^#{1,6}\s/, /^\*\s/, /^-\s/, /^\+\s/, /\*\*/, /__/, /~~/, /\!\[.*\]\(.*\)/, /\[.*\]\(.*\)/];
    return markdownPatterns.some(pattern => pattern.test(text));
  };
  
const isCursorAtTheEnd = (currentLine: string): boolean => {
    let selection = window.getSelection();
    if (!selection) return false; // Check if selection is null and return false if it is
    let range = selection.getRangeAt(0);
    let offset = range.endOffset;
        
    return offset === currentLine.length;
};

const insertNewLine = (el: HTMLElement, isBulletList: boolean): void => {
    if (!el.innerHTML.endsWith("<div><br></div>") && !el.innerHTML.endsWith("<br>")) {
        if (isBulletList) { 
            el.innerHTML += "<div>*&nbsp;</div>" // Add a new line with an asterisk and space
        } else {
            el.innerHTML += "<div><br></div>"; 
        }
    }
};

const placeCaretAtEnd = (el: HTMLElement): void => {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        if (sel) { // Check if sel is not null
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
};
