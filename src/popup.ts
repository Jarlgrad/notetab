document.getElementById('imageUpload')?.addEventListener('change', function(event) {
    console.log("we are in popup.ts")
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
                    const logoImg = document.getElementById('cc-logo');
                    if (logoImg) {
                        (logoImg as HTMLImageElement).src = e.target.result.toString();
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    }
});