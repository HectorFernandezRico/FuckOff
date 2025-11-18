// Contact Form Handler
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const orderNumber = document.getElementById('orderNumber').value;
    const message = document.getElementById('message').value;

    // Simulación de envío (en producción conectar con backend)
    const formData = {
        name,
        email,
        subject,
        orderNumber,
        message,
        timestamp: new Date().toISOString()
    };

    console.log('Formulario enviado:', formData);

    // Mostrar mensaje de éxito
    alert('¡Gracias por contactarnos! Hemos recibido tu mensaje y te responderemos en breve.');

    // Limpiar formulario
    this.reset();
});
