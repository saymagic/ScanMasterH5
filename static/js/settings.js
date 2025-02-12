$(document).ready(function() {
    // Load settings from localStorage
    const loadSettings = () => {
        try {
            return JSON.parse(localStorage.getItem('settings')) || { privacy_accepted: false };
        } catch (e) {
            return { privacy_accepted: false };
        }
    };

    // Save settings to localStorage
    const saveSettings = (settings) => {
        localStorage.setItem('settings', JSON.stringify(settings));
    };

    // Initialize settings
    const settings = loadSettings();
    $('#privacy-toggle').prop('checked', settings.privacy_accepted);

    // Privacy policy toggle
    $('#privacy-toggle').change(function() {
        const accepted = $(this).prop('checked');
        const settings = loadSettings();
        settings.privacy_accepted = accepted;
        saveSettings(settings);
    });

    // Clear storage
    $('#clear-storage').click(function() {
        if (confirm('Are you sure you want to clear all storage? This action cannot be undone.')) {
            localStorage.clear();
            alert('Storage cleared successfully');
            location.reload();
        }
    });
});
