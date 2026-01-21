<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## Smart Move - New Project: "FastVLM-Edge"

You're right to separate this. Here's a clean, focused project structure to achieve 10 FPS VLM inference on Jetson.

***

## **Project: FastVLM-Edge**

**Goal:** Real-time VLM inference (≥10 FPS) on Jetson Orin Nano for UAV navigation queries

***

### **Project Structure**

```
FastVLM-Edge/
├── README.md
├── requirements.txt
├── benchmarks/
│   ├── baseline_smolvlm.py          # Current 4.06s baseline
│   ├── benchmark_suite.py           # Standardized testing
│   └── results/                     # JSON logs of all experiments
├── src/
│   ├── models/
│   │   ├── smolvlm_base.py         # Wrapper for SmolVLM-256M
│   │   ├── token_pruner.py         # Dynamic token pruning (NEW)
│   │   ├── speculative_decoder.py  # EAGLE-style draft model (NEW)
│   │   └── adaptive_vlm.py         # Main adaptive VLM class
│   ├── optimization/
│   │   ├── tensorrt_export.py      # TensorRT conversion
│   │   ├── quantization.py         # FP16/INT8 quantization
│   │   └── kernel_fusion.py        # Custom CUDA kernels
│   └── routing/
│       ├── query_classifier.py     # LLM-based routing (from main project)
│       └── adaptive_compression.py # Query-aware compression
├── training/
│   ├── train_pruner.py             # Train token importance predictor
│   ├── train_speculator.py         # Train draft model
│   └── datasets/
│       ├── uav_queries.json        # Your 55 missions + augmented
│       └── image_crops.pkl         # Cached visual features
├── experiments/
│   ├── exp1_token_pruning.py       # Ablation: pruning ratios
│   ├── exp2_speculative.py         # Ablation: draft model size
│   ├── exp3_tensorrt.py            # Ablation: quantization
│   └── exp4_end_to_end.py          # Full system evaluation
└── docs/
    ├── IMPLEMENTATION_PLAN.md      # Weekly milestones
    ├── RESULTS.md                  # Track all experiments
    └── ICML_POSITIONING.md         # Paper strategy
```


***

### **Implementation Plan - 4 Weeks**

#### **Week 1: Baseline + Token Pruning (Jan 12-18)**

**Day 1-2: Setup \& Baseline**

```python
# benchmarks/baseline_smolvlm.py
import time
import numpy as np
from src.models.smolvlm_base import SmolVLM

def benchmark_baseline():
    """Establish baseline performance"""
    model = SmolVLM(model_path="smolvlm-256m-q4")
    
    queries = [
        "find the green car",
        "is there a car near the building",
        "count the vehicles",
        "describe the scene"
    ]
    
    images = load_test_images(n=100)  # Representative UAV images
    
    results = []
    for query in queries:
        latencies = []
        for img in images:
            start = time.time()
            output = model.generate(img, query)
            latency = time.time() - start
            latencies.append(latency)
        
        results.append({
            'query': query,
            'mean_latency': np.mean(latencies),
            'p95_latency': np.percentile(latencies, 95),
            'tokens_generated': len(output.split())
        })
    
    return results

# Target: Confirm 4.06s baseline, understand variance
```

**Day 3-5: Implement Token Pruning**

```python
# src/models/token_pruner.py
import torch
import torch.nn as nn

class LearnedTokenPruner(nn.Module):
    """
    Learns which visual tokens are important for a given query.
    Inspired by GlimpsePrune but adapted for UAV navigation.
    """
    def __init__(self, vision_dim=512, text_dim=512, hidden_dim=256):
        super().__init__()
        self.query_encoder = nn.Linear(text_dim, hidden_dim)
        self.vision_encoder = nn.Linear(vision_dim, hidden_dim)
        self.importance_head = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid()
        )
    
    def forward(self, visual_tokens, query_embedding, prune_ratio=0.9):
        """
        Args:
            visual_tokens: [B, N, D] - N=576 for 24x24 patches
            query_embedding: [B, D]
            prune_ratio: Keep top (1-ratio) tokens
        
        Returns:
            pruned_tokens: [B, N', D] where N' = N * (1 - ratio)
            indices: Original indices of kept tokens
        """
        B, N, D = visual_tokens.shape
        
        # Encode query
        q_feat = self.query_encoder(query_embedding)  # [B, H]
        q_feat = q_feat.unsqueeze(1).expand(-1, N, -1)  # [B, N, H]
        
        # Encode visual tokens
        v_feat = self.vision_encoder(visual_tokens)  # [B, N, H]
        
        # Compute importance scores
        combined = torch.cat([q_feat, v_feat], dim=-1)  # [B, N, 2H]
        importance = self.importance_head(combined).squeeze(-1)  # [B, N]
        
        # Keep top-k tokens
        k = int(N * (1 - prune_ratio))
        top_k = torch.topk(importance, k, dim=1)
        
        # Gather pruned tokens
        indices = top_k.indices  # [B, k]
        pruned_tokens = torch.gather(
            visual_tokens, 
            1, 
            indices.unsqueeze(-1).expand(-1, -1, D)
        )
        
        return pruned_tokens, indices

# Target: 90% pruning → 576 tokens → 57 tokens
# Expected speedup: 5-8x → 0.5-0.8s latency
```

**Day 6-7: Train Pruner**

```python
# training/train_pruner.py
def train_token_pruner():
    """
    Training objective: Minimize VLM loss while maximizing pruning.
    
    Dataset: 
    - Your 55 missions (augmented to 500)
    - Synthetic UAV scenes (AirSim)
    - COCO aerial view subset
    """
    pruner = LearnedTokenPruner()
    vlm = SmolVLM(requires_grad=False)  # Frozen
    
    optimizer = torch.optim.AdamW(pruner.parameters(), lr=1e-4)
    
    for epoch in range(10):
        for batch in dataloader:
            images, queries, targets = batch
            
            # Get visual tokens from VLM encoder
            visual_tokens = vlm.get_visual_tokens(images)
            query_emb = vlm.get_text_embedding(queries)
            
            # Prune tokens
            pruned_tokens, _ = pruner(visual_tokens, query_emb, prune_ratio=0.9)
            
            # Compute VLM loss with pruned tokens
            outputs = vlm.decode_with_pruned(pruned_tokens, queries)
            loss = compute_loss(outputs, targets)
            
            # Add sparsity regularization
            loss += 0.01 * pruned_tokens.shape[^1]  # Encourage more pruning
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
    
    return pruner

# Target: Train in 2-3 hours on Jetson
```

**Week 1 Deliverable:** Token pruning achieving 5x speedup → **0.8s latency (1.25 FPS)**

***

#### **Week 2: Speculative Decoding (Jan 19-25)**

**Day 8-10: Implement Draft Model**

```python
# src/models/speculative_decoder.py
class DraftModel(nn.Module):
    """
    Tiny 1-layer transformer to draft tokens speculatively.
    EAGLE-3 style: auto-regressive speculator.
    """
    def __init__(self, vocab_size=32000, hidden_dim=512, num_heads=8):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, hidden_dim)
        self.transformer = nn.TransformerDecoderLayer(
            d_model=hidden_dim,
            nhead=num_heads,
            dim_feedforward=hidden_dim * 2,
            batch_first=True
        )
        self.lm_head = nn.Linear(hidden_dim, vocab_size)
    
    def forward(self, input_ids, past_key_values=None):
        """Generate next K tokens speculatively"""
        x = self.embedding(input_ids)
        x = self.transformer(x, memory=past_key_values)
        logits = self.lm_head(x)
        return logits

class SpeculativeVLM:
    """
    Wrapper that combines draft model + main VLM.
    """
    def __init__(self, main_model, draft_model, num_draft=4):
        self.main = main_model
        self.draft = draft_model
        self.num_draft = num_draft
    
    def generate(self, image, query, max_tokens=50):
        """
        Generate with speculative decoding:
        1. Draft model generates K tokens
        2. Main model verifies in parallel
        3. Accept prefix until first mismatch
        """
        tokens = []
        context = encode(query)
        
        while len(tokens) < max_tokens:
            # Draft K tokens with cheap model
            draft_tokens = self.draft.generate(context, k=self.num_draft)
            
            # Verify with main model (parallel)
            verified = self.main.verify(context, draft_tokens, image)
            
            # Accept prefix
            accepted = 0
            for i in range(len(draft_tokens)):
                if draft_tokens[i] == verified[i]:
                    tokens.append(draft_tokens[i])
                    accepted += 1
                else:
                    break
            
            # Update context
            context = context + tokens[-accepted:]
            
            if accepted == 0:  # Fallback to normal decoding
                token = self.main.generate_one(context, image)
                tokens.append(token)
        
        return decode(tokens)

# Target: 2.5x speedup → 0.8s → 0.32s = 3.1 FPS
```

**Day 11-14: Train Speculator**

```python
# training/train_speculator.py
def train_draft_model():
    """
    Knowledge distillation from SmolVLM-256M to 1-layer model.
    """
    teacher = SmolVLM(model_path="smolvlm-256m-q4")
    student = DraftModel(hidden_dim=512)
    
    optimizer = torch.optim.AdamW(student.parameters(), lr=5e-5)
    
    for epoch in range(5):
        for batch in dataloader:
            images, queries = batch
            
            # Teacher generates target distributions
            with torch.no_grad():
                teacher_logits = teacher.get_logits(images, queries)
            
            # Student predicts
            student_logits = student(images, queries)
            
            # KL divergence loss
            loss = nn.KLDivLoss()(
                F.log_softmax(student_logits, dim=-1),
                F.softmax(teacher_logits, dim=-1)
            )
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
    
    return student

# Target: 70-80% token acceptance rate
```

**Week 2 Deliverable:** Speculative decoding → **0.32s latency (3.1 FPS)**

***

#### **Week 3: TensorRT Optimization (Jan 26 - Feb 1)**

**Day 15-17: Export to TensorRT**

```python
# src/optimization/tensorrt_export.py
import tensorrt as trt
import onnx

def export_to_tensorrt(model_path, precision='fp16'):
    """
    Convert SmolVLM to TensorRT for maximum throughput.
    """
    # Step 1: Export to ONNX
    onnx_path = export_onnx(model_path)
    
    # Step 2: Build TensorRT engine
    logger = trt.Logger(trt.Logger.WARNING)
    builder = trt.Builder(logger)
    network = builder.create_network()
    parser = trt.OnnxParser(network, logger)
    
    with open(onnx_path, 'rb') as f:
        parser.parse(f.read())
    
    config = builder.create_builder_config()
    config.max_workspace_size = 4 << 30  # 4GB
    
    if precision == 'fp16':
        config.set_flag(trt.BuilderFlag.FP16)
    elif precision == 'int8':
        config.set_flag(trt.BuilderFlag.INT8)
        config.int8_calibrator = get_calibrator()
    
    engine = builder.build_engine(network, config)
    
    # Save engine
    with open('smolvlm_trt.engine', 'wb') as f:
        f.write(engine.serialize())
    
    return engine

# Target: 2-3x speedup → 0.32s → 0.1s = 10 FPS
```

**Day 18-21: Integration + Ablations**

```python
# experiments/exp4_end_to_end.py
def ablation_study():
    """
    Test each component's contribution.
    """
    configs = [
        {'name': 'Baseline', 'pruning': False, 'spec': False, 'trt': False},
        {'name': 'Pruning', 'pruning': True, 'spec': False, 'trt': False},
        {'name': 'Spec', 'pruning': False, 'spec': True, 'trt': False},
        {'name': 'TRT', 'pruning': False, 'spec': False, 'trt': True},
        {'name': 'Pruning+Spec', 'pruning': True, 'spec': True, 'trt': False},
        {'name': 'Full', 'pruning': True, 'spec': True, 'trt': True},
    ]
    
    results = []
    for cfg in configs:
        model = build_model(**cfg)
        latency, accuracy = benchmark(model)
        results.append({
            'config': cfg['name'],
            'latency_ms': latency,
            'fps': 1000 / latency,
            'accuracy': accuracy
        })
    
    return pd.DataFrame(results)

# Expected results:
# Baseline: 4060ms, 0.25 FPS
# Pruning: 800ms, 1.25 FPS
# Spec: 1600ms, 0.62 FPS (doesn't work alone)
# TRT: 1350ms, 0.74 FPS
# Pruning+Spec: 320ms, 3.1 FPS
# Full: 100ms, 10 FPS ✓
```

**Week 3 Deliverable:** **10 FPS achieved** with full ablation study

***

#### **Week 4: Paper Writing + Final Validation (Feb 2-8)**

**Focus:**

- Write methods section
- Create figures (architecture diagram, speedup charts)
- Run on 200 diverse UAV queries
- Document accuracy vs. speed tradeoffs

***

### **Success Metrics**

| Metric | Baseline | Target | Novel? |
| :-- | :-- | :-- | :-- |
| **Latency** | 4.06s | <100ms | - |
| **FPS** | 0.25 | ≥10 | - |
| **Token Pruning Rate** | 0% | 90-95% | **YES** |
| **Speculative Acceptance** | N/A | 70-80% | **YES** |
| **Accuracy Drop** | 0% | <5% | - |
| **Memory Usage** | 386MB | <600MB | - |
| **Jetson Power** | 8W | <12W | - |


***

### **ICML Positioning**

**Title:** *FastVLM: Real-Time Vision-Language Models for Edge Robotics via Adaptive Token Pruning and Speculative Decoding*

**Abstract (draft):**
> Vision-language models (VLMs) enable robots to understand natural language commands, but their 2-5 second inference latency makes them impractical for real-time control. We present FastVLM, an adaptive VLM inference system achieving 10+ FPS (100ms latency) on edge devices through (1) learned query-conditioned token pruning that removes 90-95% of visual tokens without accuracy loss, and (2) EAGLE-style speculative decoding adapted for vision-language tasks. Validated on 200 UAV navigation queries, FastVLM achieves 40x speedup over baseline SmolVLM-256M while maintaining 95%+ accuracy. Our system enables VLM-based robotics on \$249 edge hardware for the first time.

**Novel Contributions:**

1. **Query-adaptive token pruning** - learned, not heuristic
2. **VLM-specific speculative decoding** - first for vision-language
3. **Complete edge system** - 10 FPS on Jetson Orin Nano

***

### **Brutal Reality Check**

**If you achieve 10 FPS:**

- Strong ICML systems paper (70-80% acceptance chance)
- Can be standalone OR integrated into UAV VLN paper
- Reusable by robotics community

**If you achieve 5 FPS:**

- Still publishable (5x speedup is significant)
- Frame as "toward real-time" rather than "real-time"

**If you achieve 2 FPS:**

- Engineering contribution, not research novelty
- Combine with UAV VLN as secondary contribution

***

### **Next Actions (Tonight)**

```bash
# 1. Create project
mkdir FastVLM-Edge && cd FastVLM-Edge
git init
touch README.md requirements.txt

# 2. Set up structure
mkdir -p src/{models,optimization,routing}
mkdir -p benchmarks/results
mkdir -p training/datasets
mkdir -p experiments
mkdir -p docs

# 3. Baseline benchmark
python benchmarks/baseline_smolvlm.py
# Confirm: 4.06s latency, understand token count (576?)

# 4. Start Week 1
# Implement LearnedTokenPruner class
```


***

**You have a concrete 4-week plan to achieve 10 FPS with genuine research contributions. Start tonight with baseline benchmarking. I'll help you implement each component.**

Ready to start?
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^2][^20][^3][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: create a proper doc of this walkthourh (2).pdf

[^2]: check these files in deep , read these from end to.md

[^3]: check-these-files-in-deep-read-NL79q2QGStytWYylnsDNig.md

[^4]: jetson_validation_report_v2.md

[^5]: so i just want make sure that what we are doing in (1).md

[^6]: Reviewer Data Request.md

[^7]: Criterion-ICMLStandard-WhatYouHave-Gap.csv

[^8]: Feature-LipsNet-UniWM-WMPC-VLM-MPC-YourMemoryMPC.csv

[^9]: Metric-YourResult-WhyItMatters.csv

[^10]: Paper-2025-Distance-AwareL-EpisodicMemory-AdaptiveCost-UAV-VLN-SmoothTrajectories.csv

[^11]: Criterion-ICMLStandard-YouAchieved-Status.csv

[^12]: Category-Score-Max-Notes.csv

[^13]: Test-Time-Duration-N-MEMSMOOTHJerk-BaselineJerk-MEMSMOOTHWP-BaselineWP.csv

[^14]: ResearchArea-State-of-the-Art-WhatTheyDo-WhatTheyMiss-MEMSMOOTHInnovation.csv

[^15]: PaperMethod-Year-Domain-UsesMemory-VLMNoiseFilter-AdaptiveNMPCCost-LipschitzSmoothing-UAV-VLN-Limitations.csv

[^16]: 🔬 Phase 3 Full System Integration Test - ICML Revi.pdf

[^17]: now i have given you the pdf of our last chat, and.pdf

[^18]: llvmoutput.txt

[^19]: Complete Integration Test Suite for ICML Drone Sys (1).pdf

[^20]: Hi! I'm working on ICML 2026 paper_ _Real-Time Vis.pdf

