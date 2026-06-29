import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ArrowLeft, MessageSquare, Loader2, FileText, CheckCircle2, AlertCircle, RefreshCw, Layers, Download, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('processing');
  const [review, setReview] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
    const interval = setInterval(() => {
      if (processingStatus === 'processing') {
        pollStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, processingStatus]);

  const fetchProjectData = async () => {
    try {
      const [projRes, docsRes, reviewRes, chatRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/documents`),
        api.get(`/projects/${id}/reviews/latest`).catch(() => ({ data: { data: { review: null } } })),
        api.get(`/chat/sessions`).then(res => ({
          data: { data: { session: res.data.data.sessions.find(s => s.projectId._id === id) } }
        })).catch(() => ({ data: { data: { session: null } } }))
      ]);

      setProject(projRes.data.data.project);
      setDocuments(docsRes.data.data.documents);
      
      const rev = reviewRes.data.data.review;
      setReview(rev);
      setChatSession(chatRes.data.data.session);

      if (rev?.status === 'completed' || rev?.status === 'failed') {
        setProcessingStatus(rev.status);
      } else {
        checkDocStatus(docsRes.data.data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch project data', error);
    } finally {
      setIsLoading(false);
    }
  };

  async function pollStatus() {
    try {
      const [docsRes, reviewRes] = await Promise.all([
        api.get(`/projects/${id}/documents/status`),
        api.get(`/projects/${id}/reviews/latest`).catch(() => ({ data: { data: { review: null } } }))
      ]);

      const rev = reviewRes.data.data.review;
      setReview(rev);

      if (rev?.status === 'completed' || rev?.status === 'failed') {
        setProcessingStatus(rev.status);
        // Re-fetch everything if status changed to completed to get chat session
        fetchProjectData();
      } else {
        const overallStatus = docsRes.data.data.overallStatus;
        if (overallStatus !== 'processing' && !rev) {
          // Docs finished but review not started (shouldn't happen with orchestrator, but just in case)
          setProcessingStatus(overallStatus);
        }
      }
    } catch (error) {
      console.error('Failed to poll status', error);
    }
  };

  const checkDocStatus = (docs) => {
    const allProcessed = docs.every(d => d.status === 'processed' || d.status === 'failed');
    if (allProcessed && !review) {
      setProcessingStatus(docs.some(d => d.status === 'failed') ? 'completed_with_errors' : 'completed');
    }
  };

  const handleOpenChat = () => {
    if (chatSession) {
      navigate(`/projects/${id}/chat`);
    }
  };

  const reportRef = useRef(null);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-lime-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleDownloadPdf = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `${project?.name?.replace(/\s+/g, '_') || 'Project'}_Architecture_Report`,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-1">
            {project.description || 'Architecture Review Project'}
          </p>
        </div>
        {processingStatus === 'completed' && (
          <Button onClick={handleOpenChat}>
            <MessageSquare className="mr-2 h-4 w-4" /> Chat with Architecture
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Uploaded reference material</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li key={doc._id} className="flex items-start justify-between text-sm p-2 border rounded bg-muted/30">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{doc.fileName}</span>
                  </div>
                  {doc.status === 'processed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" title="Processed" />
                  ) : doc.status === 'failed' ? (
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" title={doc.processingError} />
                  ) : (
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" title="Processing" />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          {processingStatus === 'processing' || review?.status === 'generating' ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mb-6" />
              <h3 className="text-xl font-semibold mb-2">Analyzing Architecture</h3>
              <p className="text-muted-foreground max-w-md">
                Our AI is currently processing your documents, identifying components, extracting architecture patterns, and generating a comprehensive review.
              </p>
              <div className="w-full max-w-md mt-8 space-y-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse rounded-full w-2/3"></div>
                </div>
                <p className="text-xs text-muted-foreground">This may take a few minutes depending on document size.</p>
              </div>
            </div>
          ) : processingStatus === 'failed' || review?.status === 'failed' ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-destructive h-full">
              <AlertCircle className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analysis Failed</h3>
              <p className="max-w-md">{review?.executiveSummary || 'An error occurred during processing.'}</p>
            </div>
          ) : review ? (
            <>
              <div className="flex justify-end p-4 border-b bg-muted/5">
                <Button variant="outline" size="sm" onClick={() => handleDownloadPdf()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print / Save as PDF
                </Button>
              </div>
              <div id="architecture-report" ref={reportRef} className="print:p-8">
                <CardHeader className="border-b bg-muted/10 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Layers className="h-6 w-6 text-primary" /> Architecture Review Report
                      </CardTitle>
                      <CardDescription className="mt-1">Generated {new Date(review.generatedAt).toLocaleString()}</CardDescription>
                    </div>
                    <div className="text-center bg-background border rounded-lg p-3 shadow-sm">
                      <div className={`text-3xl font-bold ${getScoreColor(review.scores?.overall?.score)}`}>
                        {review.scores?.overall?.score || 'N/A'}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Overall Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border">
                    {['security', 'scalability', 'performance', 'cost', 'maintainability'].map((category) => (
                      <div key={category} className="bg-background p-4 text-center">
                        <div className="text-xs font-medium text-muted-foreground capitalize mb-1">{category}</div>
                        <div className={`text-xl font-bold ${getScoreColor(review.scores?.[category]?.score)}`}>
                          {review.scores?.[category]?.score || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 space-y-8">
                    <section>
                      <h3 className="text-lg font-semibold mb-3 border-b pb-2">Executive Summary</h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                        <ReactMarkdown>{review.executiveSummary}</ReactMarkdown>
                      </div>
                    </section>

                    {review.insights && review.insights.length > 0 && (
                      <section>
                        <div className="space-y-4">
                          {review.insights.map((insight, idx) => {
                            const isCritical = insight.insightType.toLowerCase().includes('critical');
                            const isOptimization = insight.insightType.toLowerCase().includes('optimization');
                            
                            const borderColor = isCritical ? 'border-red-500' : isOptimization ? 'border-yellow-500' : 'border-blue-500';
                            const textColor = isCritical ? 'text-red-600 dark:text-red-400' : isOptimization ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400';
                            const bgColor = isCritical ? 'bg-red-50 dark:bg-red-950/20' : isOptimization ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'bg-blue-50 dark:bg-blue-950/20';
                            
                            return (
                              <div key={idx} className={`border-l-4 ${borderColor} ${bgColor} pl-4 py-3 pr-4 rounded-r-md`}>
                                <div className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>{insight.insightType}</div>
                                <div className="font-semibold text-base mt-1 text-slate-900 dark:text-slate-100">{insight.component}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{insight.description}</div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {review.findings && review.findings.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Detailed Findings</h3>
                        <div className="space-y-4">
                          {review.findings.map((finding, idx) => (
                            <div key={idx} className="border rounded-lg p-4 bg-muted/10">
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                  finding.severity === 'Critical' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                                  finding.severity === 'High' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                  finding.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                                  'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                }`}>
                                  {finding.severity}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-base">{finding.issue}</h4>
                                  <div className="text-xs text-muted-foreground mb-2 mt-1 font-medium">{finding.category}</div>
                                  <p className="text-sm text-muted-foreground mb-3">{finding.explanation}</p>
                                  <div className="bg-background border rounded-md p-3 text-sm">
                                    <span className="font-semibold text-primary block mb-1">Recommendation:</span>
                                    {finding.recommendation}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </CardContent>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <p>No review available.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
