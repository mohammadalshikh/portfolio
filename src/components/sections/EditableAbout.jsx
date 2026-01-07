/**
 * EditableAbout - Edit mode version of About section (intro + skills)
 */
const EditableAbout = ({ about = {}, onChange }) => {
    const { intro = '', skills = [] } = about;
    const skillsValue = Array.isArray(skills) ? skills.join(', ') : skills || '';

    const handleFieldChange = (field, value) => {
        onChange({ ...about, [field]: value });
    };

    const handleSkillsBlur = (value) => {
        if (typeof value === 'string') {
            const array = value.split(',').map((item) => item.trim()).filter((item) => item);
            onChange({ ...about, skills: array });
        }
    };

    return (
        <div>
            <div className="form-group">
                <textarea
                    value={intro}
                    onChange={(e) => handleFieldChange('intro', e.target.value)}
                    className="editable-textarea section-text"
                    rows={6}
                    placeholder="Write a short intro about yourself..."
                />
            </div>

            <div className="form-group mt-lg">
                <input
                    type="text"
                    value={skillsValue}
                    onChange={(e) => handleFieldChange('skills', e.target.value)}
                    onBlur={(e) => handleSkillsBlur(e.target.value)}
                    className="editable-input"
                    placeholder="Python, React, Java"
                />
            </div>
            {Array.isArray(about.skills) && about.skills.length > 0 && (
                <div className="skill-tags mt-sm">
                    {about.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EditableAbout;
