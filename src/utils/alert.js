import Swal from 'sweetalert2';

// Base configuration to match the app's aesthetic
const customSwal = Swal.mixin({
    customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-text',
        confirmButton: 'login-btn', // Reuse existing button style
    },
    buttonsStyling: false,
    background: 'var(--card-bg)', // Adapts to light/dark mode
    color: 'var(--text-primary)',
    backdrop: `rgba(0,0,0,0.6)`,
    showClass: {
        popup: 'animate__animated animate__fadeInUp animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster'
    }
});

/**
 * Display a success alert
 * @param {string} title 
 * @param {string} text 
 */
export const showSuccessAlert = (title, text) => {
    return customSwal.fire({
        icon: 'success',
        title: title || 'Success!',
        text: text,
        iconColor: '#10b981',
    });
};

/**
 * Display an error alert
 * @param {string} title 
 * @param {string} text 
 */
export const showErrorAlert = (title, text) => {
    return customSwal.fire({
        icon: 'error',
        title: title || 'Oops...',
        text: text,
        iconColor: '#ef4444',
    });
};

/**
 * Display an info/warning alert
 * @param {string} title 
 * @param {string} text 
 */
export const showInfoAlert = (title, text) => {
    return customSwal.fire({
        icon: 'info',
        title: title || 'Notice',
        text: text,
        iconColor: 'var(--primary-color)',
    });
};
