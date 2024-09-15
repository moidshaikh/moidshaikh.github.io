// <!-- script.js -->
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = encodeURIComponent(document.getElementById('name').value);
    const email = encodeURIComponent(document.getElementById('email').value);
    const message = encodeURIComponent(document.getElementById('message').value);
    
    const mailtoLink = `mailto:shaikhamoid777@gmail.com?subject=Contact from Portfolio&body=Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0AMessage:%0D%0A${message}`;
    
    window.location.href = mailtoLink;
});