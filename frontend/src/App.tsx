import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, CircularProgress, Card, CardContent, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { backend } from 'declarations/backend';

interface Post {
  id: bigint;
  title: string;
  body: string;
  author: string;
  timestamp: bigint;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await backend.getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    try {
      const result = await backend.createPost(title, body, author);
      if ('ok' in result) {
        setShowForm(false);
        setTitle('');
        setAuthor('');
        setEditorState(EditorState.createEmpty());
        fetchPosts();
      } else {
        console.error('Error creating post:', result.err);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Crypto Blog</Typography>
        </Toolbar>
      </AppBar>
      <Container className="container">
        {loading ? (
          <CircularProgress />
        ) : (
          <div>
            {posts.map((post) => (
              <Card key={post.id.toString()} className="post-card">
                <CardContent>
                  <Typography variant="h5">{post.title}</Typography>
                  <Typography variant="subtitle2">By {post.author}</Typography>
                  <Typography variant="body1" dangerouslySetInnerHTML={{ __html: post.body }} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {showForm && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
            <Editor
              editorState={editorState}
              onEditorStateChange={setEditorState}
              wrapperClassName="rich-editor"
            />
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </form>
        )}
        <Fab color="primary" aria-label="add" className="fab" onClick={() => setShowForm(!showForm)}>
          <AddIcon />
        </Fab>
      </Container>
    </div>
  );
};

export default App;