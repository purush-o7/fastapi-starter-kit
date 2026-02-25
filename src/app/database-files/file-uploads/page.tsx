"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function FileUploadsPage() {
  return (
    <div className="max-w-4xl ambient-database">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">File Uploads</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          FastAPI handles file uploads through multipart form data. Use File and UploadFile for efficient file handling with metadata access and streaming support.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Single File Upload</h2>
          <p className="text-muted-foreground mb-4">Use UploadFile for file uploads with access to filename, content type, and streaming reads.</p>
          <CodeBlock code={`from fastapi import FastAPI, UploadFile

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile):
    contents = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
    }`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Multiple Files</h2>
          <p className="text-muted-foreground mb-4">Accept multiple files by declaring a list of UploadFile parameters.</p>
          <CodeBlock code={`@app.post("/upload-many")
async def upload_files(files: list[UploadFile]):
    results = []
    for file in files:
        contents = await file.read()
        results.append({
            "filename": file.filename,
            "size": len(contents),
        })
    return {"uploaded": results}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">File Validation</h2>
          <p className="text-muted-foreground mb-4">Validate file type and size before processing.</p>
          <CodeBlock code={`ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

@app.post("/upload-image")
async def upload_image(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "File type not allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(400, "File too large (max 5MB)")

    # Save to disk
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        f.write(contents)

    return {"filename": file.filename, "path": path}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">UploadFile</p>
              <p className="text-xs text-muted-foreground">Provides filename, content_type, and async read/seek methods</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Streaming</p>
              <p className="text-xs text-muted-foreground">Read large files in chunks to avoid memory issues</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Validation</p>
              <p className="text-xs text-muted-foreground">Always validate file type, size, and content before storage</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Form + Files</p>
              <p className="text-xs text-muted-foreground">Combine UploadFile with Form() for file + metadata uploads</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
