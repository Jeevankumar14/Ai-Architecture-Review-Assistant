import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { ArrowLeft, UploadCloud, File, X, AlertCircle } from 'lucide-react';

export default function NewProject() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 10)); // Max 10 files
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (files.length === 0) {
      setError('Please select at least one document to analyze.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create project
      const projectRes = await api.post('/projects', {
        name,
        description,
        tags: ['Architecture Review'],
      });
      
      const projectId = projectRes.data.data.project._id;

      // 2. Upload documents
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('documents', file);
      });

      await api.post(`/projects/${projectId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 3. Navigate to project details
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while creating the project.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Architecture Review</h1>
          <p className="text-muted-foreground mt-1">
            Create a project and upload architecture documents for AI analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Provide basic information about the system being reviewed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g. Payment Gateway Microservices"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Briefly describe the purpose of the architecture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Architecture Documents <span className="text-destructive">*</span></Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload HLD, LLD, SRS, or API Specs (PDF, DOCX, TXT, JSON, YAML, MD). Max 25MB per file.
                </p>
              </div>

              <div className="border-2 border-dashed border-input rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mb-4">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                
                <div className="relative">
                  <Input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    multiple 
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt,.json,.yaml,.yml,.md"
                  />
                  <Button type="button" variant="secondary">Select Files</Button>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Selected Files ({files.length}/10)</h4>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <File className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm truncate font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name || files.length === 0}>
              {isSubmitting ? 'Creating Project & Processing...' : 'Start AI Analysis'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
