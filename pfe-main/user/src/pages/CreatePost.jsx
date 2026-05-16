import React, { useState } from 'react';
export const CreatePost = () => {
  const [formData, setFormData] = useState({
    category: 'Nutrition Tips',
    title: '',
    content: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Post submitted for admin review!');
    console.log("Submitting to database:", formData);
  };

  return (
    <div className="create-post-wrapper">
      <style>{CSS}</style>
      
      <div id="view-posts" className="view-content">
        <div className="page-header">
          <h2>Create a Post</h2>
          <p>Share your expertise with the Chrysalis community</p>
        </div>

        <div className="card">
          <form className="post-form" onSubmit={handleSubmit}>
            {/* CATEGORY SELECT */}
            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Category</label>
              <select 
                className="post-select"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Nutrition Tips</option>
                <option>Recipe Ideas</option>
                <option>Metabolic Health</option>
                <option>Weight Management</option>
                <option>Sports Nutrition</option>
              </select>
            </div>

            {/* TITLE INPUT */}
            <label className="field-label">Post Title</label>
            <input 
              className="post-input"
              type="text" 
              placeholder="e.g. 5 Foods That Boost Your Metabolism"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />

            {/* CONTENT TEXTAREA */}
            <label className="field-label">Content</label>
            <textarea 
              className="post-textarea"
              placeholder="Write your blog post or tip here..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            ></textarea>

            {/* MEDIA UPLOAD GRID */}
            <div className="post-grid">
              <div className="media-zone" onClick={() => alert('Image upload coming soon!')}>
                <h4>Upload Image</h4>
                <p>PNG, JPG up to 10MB</p>
              </div>
              <div className="media-zone" onClick={() => alert('Video upload coming soon!')}>
                <h4>Upload Video</h4>
                <p>MP4 up to 100MB</p>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="btn-green-submit">
              Submit for Admin Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CSS = `
  .view-content { padding: 20px; font-family: 'DM Sans', sans-serif; max-width: 800px; margin: 0 auto; }
  
  .page-header h2 { font-family: 'Sora', sans-serif; color: #174530; margin-bottom: 4px; }
  .page-header p { color: #64748b; font-size: 14px; margin-bottom: 24px; }

  .card { background: white; border-radius: 18px; padding: 24px; border: 1px solid #e2e8f0; }

  .field-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; display: block; margin-bottom: 6px; }

  .post-select, .post-input, .post-textarea {
    width: 100%; border: 1.5px solid #e2e8f0; padding: 12px 14px; border-radius: 14px; 
    font-size: 14px; outline: none; font-family: 'DM Sans', sans-serif; background: white;
    margin-bottom: 18px; box-sizing: border-box; transition: 0.2s;
  }

  .post-select:focus, .post-input:focus, .post-textarea:focus { border-color: #216345; }
  .post-textarea { height: 180px; resize: none; }

  .post-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }

  .media-zone {
    border: 2px dashed #cbd5e1; border-radius: 14px; padding: 20px; text-align: center;
    cursor: pointer; transition: 0.2s; background: #f8fafc;
  }
  .media-zone:hover { border-color: #216345; background: #f0fdf4; }
  .media-zone h4 { margin: 0; font-size: 14px; color: #1e293b; }
  .media-zone p { margin: 4px 0 0; font-size: 12px; color: #64748b; }

  .btn-green-submit {
    width: 100%; padding: 14px; background: #216345; color: white; border: none;
    border-radius: 14px; font-weight: 700; font-size: 15px; cursor: pointer; transition: 0.2s;
  }
  .btn-green-submit:hover { background: #174530; transform: translateY(-1px); }
`;

export default CreatePost;