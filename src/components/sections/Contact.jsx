/**
 * Contact form
 */
const Contact = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        fetch('https://formspree.io/f/mvgvwwaq', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    alert('Message sent successfully!');
                    form.reset();
                } else {
                    alert('Failed to send message. Please try again.');
                }
            })
            .catch(() => {
                alert('Failed to send message. Please try again.');
            });
    };

    return (
        <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
                <label htmlFor="name" className="form-label">Name *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="form-input"
                    placeholder="Your name"
                />
            </div>

            <div className="form-group">
                <label htmlFor="email" className="form-label">Email *</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="email@example.com"
                />
            </div>

            <div className="form-group">
                <label htmlFor="message" className="form-label">Message *</label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows="4"
                    className="form-textarea"
                    placeholder="Your message here..."
                />
            </div>

            <button type="submit" className="form-submit-btn">
                Send Message
            </button>
        </form>
    );
};

export default Contact;
