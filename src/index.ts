import showdown from 'showdown';
import Holidays from 'date-holidays';

import type { Note } from './noteUtils';
import { isCursorAtTheEnd, isMarkdown, placeCaretAtEnd, insertNewLine } from './noteUtils';
import { saveNote, displaySavedNotes } from './noteStorage';

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
    const swedishHolidays = holidays.getHolidays(year);

    const nextMonth = (currentDate.getMonth() + 1) % 12; // Get the next month
    const nextMonthFirstDay = new Date(year, nextMonth, 1);
    const lastMonthDay = new Date(nextMonthFirstDay.getTime() - 86400000); // Subtract a day to get the last day of the current month

    if (lastMonthDay.getDay() >= 1 && lastMonthDay.getDay() <= 5 && currentDate === lastMonthDay) {
        const formattedCurrentDate = currentDate.toISOString().split('T')[0];
        const isHoliday = swedishHolidays.some(holiday => holiday.date === formattedCurrentDate);
        if (isHoliday) {
            return false;
        }
        return true;
    }
    return false;
}

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

document.getElementById('logo')?.addEventListener('click', function() {
    document.getElementById('imageUpload')?.click(); // Trigger file input dialog
});

document.getElementById('imageUpload')?.addEventListener('change', function(event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (e.target && e.target.result) {
                    // Store the Base64 string in localStorage
                    localStorage.setItem('customLogo', e.target.result.toString());
                    // Update the cc-logo image if it's displayed in the popup
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

document.addEventListener('DOMContentLoaded', function() {
    const customLogo = localStorage.getItem('customLogo');
    const logoImg = document.getElementById('cc-logo');
    if (customLogo && logoImg) {
        (logoImg as HTMLImageElement).src = customLogo;
    }
});