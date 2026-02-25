"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function PathParametersPage() {
  return (
    <div className="max-w-4xl ambient-routing">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Path Parameters</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Path parameters let you capture dynamic values from URL segments. FastAPI validates and converts them automatically using Python type hints.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Path Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Declare path parameters using curly braces in the path string and matching function parameters with type hints.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# GET /items/42 → {"item_id": 42}
# GET /items/foo → 422 Validation Error`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Enum Path Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Use Python Enum classes to restrict path parameters to a fixed set of values.
          </p>
          <CodeBlock
            code={`from enum import Enum
from fastapi import FastAPI

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

app = FastAPI()

@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name is ModelName.alexnet:
        return {"model": model_name, "message": "Deep Learning FTW!"}
    return {"model": model_name}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Path Parameters with Paths</h2>
          <p className="text-muted-foreground mb-4">
            Use the :path converter to capture file paths that include forward slashes.
          </p>
          <CodeBlock
            code={`@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    return {"file_path": file_path}

# GET /files/home/user/data.csv
# → {"file_path": "home/user/data.csv"}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Auto Validation</p>
              <p className="text-xs text-muted-foreground">Type hints drive automatic validation — int, str, float, UUID</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Enum Constraints</p>
              <p className="text-xs text-muted-foreground">Python Enums restrict parameters to predefined values</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Order Matters</p>
              <p className="text-xs text-muted-foreground">Fixed paths must be declared before parameterized ones</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Path Converter</p>
              <p className="text-xs text-muted-foreground">Use :path to capture values containing forward slashes</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
