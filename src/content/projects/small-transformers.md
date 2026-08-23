---
title: 'Small Transformer'
description: 'Small transformers for algorithmic tasks'
pubDate: '2026-08-20'
---


### August 22, 2026

I was playing with the addition again. I wanted to try some of the tricks used in the small models, whether they would generalize to the  multiplication. So I tried to add RMS norm to the Q and K outputs, I tried to create multiple Q heads (but keep single K and V), I tried RoPE. I could not get convergence with any of those, when I decreased the size of the model. Could be unlucky, could be skill issue,

I tried to reduce dimensionality of the embedding from 7 to 6, which would reduce the parameters from 651 to 534, but even when trying couple of samples I could not get it to work. Nice thing is that based on the first part of the training, where you train on the instances with at most 3 digits, based on the loss, you can already tell whether the run will be successful or not. This saves quite a lot of time when running experiments, as it is roughly 2000 iterations. Well, maybe it is not that good of a predictor. I just had run where the 3 digits training worked well, then the 6 digit training just did not converge. I think that the embedding of size 6 cannot be done naively without other tricks I did not incorporate yet (like factorization). I decided to run a sweep through 15 seeds to see whether any of them would work and the best result only got accuracy 50%. A lot of the runs get 0%.

I think the Qwen style transformer (more Q-heads than KV-heads) may be a good idea to try in other projects, especially with the diffusion models.



### August 21, 2026

It was interesting to play with the adding of two numbers, but I was ready to take on a bigger fish and that was multiplication. And I thought this is going to be straight-forward, just taking the same codebase and only change the training data. So I decided to use quite large model with ~50k parameters and I limited myself to 3-digit number multiplication. And after few training iterations, I already knew that this is a completely different thing.

Wheras in addition training, the model exhibits the usual grokking behavior, where model does not seem to learn at first, after some time it suddenly jumps in accuracy to nearly 100%, where it stays, or only partially degrades until it comes back to 100%. When you run the multiplication training, it resembles the usual deep learning behavior. The loss gradually decreases, the accuracy steadily rises. This sounds like a good thing at first, but unlike the clear distinction of the addition task, where we can say: The model has learned the algorithm", it is hard to say the same thing in the multiplication task, because it could just be some overfitting of the model.

I have found this paper (https://arxiv.org/pdf/2510.00184), where the authors claim that the transformers are pretty bad with multiplication. I only skimmed the paper, but if I understand it correctly, the main claim is that the multiplication needs a long-range dependencies, which the difficult fo transformers to learn. They show a CoT approach where they let the model to do the partial sums. I would like to try that.

But besides that I have tried one other thing. That is training the transformer to multiply 7-digit numbers with 1-digit one. Good news is that the model can learn this simpler setting. The addition task starts with 2000 iterations training only on at most 3 digit numbers, then it has 5000 iterations on training of up to 6-digit numbers and only then it uses all 10 digits. Maybe the multiplication needs similar paradigm, but with even more data.

Well, those are the two things to try: 1. Add the intermediate results in the training and find out whether it helps the model to generate the result. 2. Play with a scheduling of the size of training instances to first learn on small ones, which will be gradually increased.

### August 20, 2026

While ago I have read about this project of Yeb Havinga (https://github.com/yhavinga/gpt-acc-jax), where he managed to train transformer with 777 parameters to perform addition of 2 10-digit numbers with nearly 100% accuracy. I took this as a proof that the transformer hacan learn the addition algorithm by itself. Still, I wanted to see this myself, so I created a codebase (https://github.com/kubicon/tiny_models), where I reimplemented simple transformer and tried it myself.

When you start with a big model, everything converges quite nicely, but as you are decreasing the model, the whole training is becoming less and less stable. When I got to models at around 1000 parameters I could not get them to converge, no matter how hard I tried, even when I used the exact same hyperparameter and training setting as Havinga.

After a brief discussion with Claude, it identified that my codebase is slightly off because I train different embedding for decoder and encoder, wheras Havinga's codebase reuses them. When I changed this, it reduced parameter count, but more importantly, it started working. This was surprising to me, becuase I would've thought that the model would be capable of learning different embeddings. However, I decided not to pursue this further.

I was toying a bit with this approach, I replaced layer norm with RMS norm and gelu with SwiGLU. I also avoided using the <PAD> token. I am not sure why Havinga was using it, but it seemed useless to me. After few trials and errors I ended up with transformer that had 651 parameters. These are the final parameters

| Layer | Parameters |
|-|-|
| Token embedding | 13 x 7 = 91 |
| Positional embeddings | 34 x 7 = 238 |
| RMSNorm pre-attention | 7 |
| Attention | 7 x 21 = 147 |
| Out projection | 7 x 7 = 49 |
| RMSNorm pre-MLP | 7 |
| MLP + GLU  | 7 x (2 x 5) = 70 |
| MLP out | 5 * 7 = 35 |
| RMSNorm final | 7 |
| Total | 651 |

I was happy about this. Then I found out leaderboards of this challenge (https://github.com/anadim/AdderBoard) and noticed that the record right now is 36 parameters. Well, I am quite far away from that, but I am still happy. The record-holder does few interesting tricks like using only a single matrix in attention, where Q = V and K = rot(Q). All RMSNorms are shared. Instead of the learned positional embeddings, they use rotational embedding.The actually shrink the embedding dimension to 3 and the MLP has just size 2. Well plenty of crazy things, but I decided not to pursue this.