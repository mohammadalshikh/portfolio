/**
 * Edit mode version of About section
 */
const EditableAbout = ({ about = {}, onChange }) => {
    const { intro = '' } = about;

    const handleFieldChange = (field, value) => {
        onChange({ ...about, [field]: value });
    };

    return (
        <div className="form-group">
            <textarea
                value={intro}
                onChange={(e) => handleFieldChange('intro', e.target.value)}
                className="editable-textarea section-text"
                rows={6}
                placeholder="Write a short intro about yourself..."
            />
        </div>
    );
};

export default EditableAbout;
