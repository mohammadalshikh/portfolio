/**
 * About Component - Displays personal information
 *
 * @param {Object} about - { intro, skills }
 */
const About = ({ about = {} }) => {
    const { intro = '', skills = [] } = about;

    return (
        <div className="about-container">
            {intro && (
                <div className="about-card">
                    <h3 className="about-card-title-welcome">
                        Welcome! 👋
                    </h3>
                    <p className="about-card-text">
                        {intro}
                    </p>
                </div>
            )}

            {skills.length > 0 && (
                <div className="about-card">
                    <h3 className="about-card-title-skills">
                        Skills & Technologies
                    </h3>
                    <div className="about-skills-list">
                        {skills.map((skill, idx) => (
                            <span key={idx} className="about-skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default About;
