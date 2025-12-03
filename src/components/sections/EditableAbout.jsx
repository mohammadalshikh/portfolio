/**
 * EditableAbout - Edit mode version of About component
 *
 * @param {Object} about - { intro, skills }
 * @param {Function} onChange - function(newAbout)
 */
const EditableAbout = ({ about = {}, onChange }) => {
    const { intro = '', skills = [] } = about;

    // Local copies of array-like fields as strings while editing
    const skillsValue = Array.isArray(skills) ? skills.join(',') : skills || '';

    const handleFieldChange = (field, value) => {
        onChange({ ...about, [field]: value });
    };

    const handleArrayChange = (field, value) => {
        // store raw string while editing
        onChange({ ...about, [field]: value });
    };

    const handleArrayBlur = (field, value) => {
        // parse into array on blur
        if (typeof value === 'string') {
            const array = value.split(',').map((item) => item.trim()).filter((item) => item);
            onChange({ ...about, [field]: array });
        }
    };

    return (
        <div className="editable-about-container">
            <div className="editable-about-card">
                <h3 className="editable-about-title-welcome">Welcome! 👋</h3>
                <textarea
                    value={intro}
                    onChange={(e) => handleFieldChange('intro', e.target.value)}
                    className="editable-about-textarea"
                    rows={6}
                    placeholder="Write a short intro about yourself..."
                />
            </div>

            <div className="editable-about-card">
                <h3 className="editable-about-title-skills">Skills & Technologies</h3>
                <div className="editable-about-input-wrapper">
                    <input
                        type="text"
                        value={skillsValue}
                        onChange={(e) => handleArrayChange('skills', e.target.value)}
                        onBlur={(e) => handleArrayBlur('skills', e.target.value)}
                        className="editable-about-input"
                        placeholder="Python, React, Java"
                    />
                </div>

                {Array.isArray(about.skills) && about.skills.length > 0 && (
                    <div className="editable-about-skills-preview">
                        {about.skills.map((s, i) => (
                            <span key={i} className="editable-about-skill-tag">{s}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditableAbout;
