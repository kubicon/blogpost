---
title: 'Diffusion Language Models'
description: 'Replacing auto-regressive models with diffusion language models.'
pubDate: '2026-08-13'
---

### August 29, 2026

The results fromthe last experiment, which was pre-training with autoregressive and then continue the training with diffusion were qiute underwhelming. Good news is that ~4000 diffusion iterations without the autoregressive pretraining the loss goes to 4.2, with pretraining it is 4. I thought that the gains would be more substantial.

I was already mentioning this in some of my prior notes. Comparing the autoregressive with diffusion models just based on loss seems unfair. Intuitively: If you are decoding 64 words at once based on previous 64 words, you have much more free space to come up with "new" ideas than the autoregressive model.

I think it may be possible to formalize this property. The autoregressive model is just the pure Bayesian generation, wheras the autoregressive model is more of a joint probability.

### August 25, 2026

The training of the autoregressive model was running overnight. Now I started the training from the checkpoint. The cluster I use at the university seems to be quite crowded for the last couple of days. Let's see how it goes.

### August 24, 2026

I tried to use Qwen-like transformer -> Several Q heads for single K and V heads. I did it by reducing the number of KV heads. I know it is mainly a inference-time speed up (and memory-wise). But it did not help with training at all. The training speed was the same and the convergence was going slightly slower. So in the end, it did not buy anything.

I was thinking about other thing I heard people do with diffusion models. You start the training with the autoregressive model (as it learns quicker) and then you use these weights as warm-start for the diffusion. The only thing the diffusion then learns is the bidirectional attention within the denoising block (it keeps learning the other parts, but at least not from scratch).

On the paper this idea makes sense, so I wanted to see how it goes. I reimplemented the nanoGPT in Jax (such that it uses the exact same networks as the diffusion) and I ran the training. Weirdly my Jax implementation of nanoGPT is 2-times slower! Even after telling Opus to optimize the code, it is still 1.5 times slower. My dream about Jax being always superior is breaking. I will try to find out what is going on later, but kudos to PyTorch for being much faster than I thought. 

### August 21, 2026

I have tried few things to make this better. Not sure whether I can optimize the code to get some huge gains. So I at least tried to find out what happens when I decrease the block-size (if the block-size = 1, you get the usual autoregressive model). In the previous experiments I have used block-size 64 and in the new one I used 16 and 32. Besides that, I have tried to use AdamW, instead of Muon which I was using so far. Even with 4-times smaller learning rate, the AdamW was comparable to Muon. But the decreased block-size slightly improved the loss. But only slighly, I do not think it is comparable to the autoregressive model.

Or is it? I am not sure, I am just measuring loss and cross-entropy error, but are those directly comparable? I don't know, Claude is giving me mixed signals about this and intuitively I just think this is not the same. But then, how should I evaluate the diffusion model? I do not have answer for that yet, but maybe I'll find something.

### August 13, 2026

I like diffusion. The whole concept of training a model that only removes noise from an image, such that in inference you sample the noise and denoise it into an image, is fascinating to me. As such I would love if even language generation was diffusion-based.

I know there are works like Gemini-diffusion that try to do this, but it seems that not diffusion model really had a succes. Of course I know the problems of diffusion models. Their training is much more computationally intensive than that of transformers. You need both more data, and the training step is much longer. Also during inference there is not such a trick as KV-caching that would sped up the whole generation process. However, I think that some of the benefits are still worthy. The one I like the most is the fact, that when you are generating the response, you are also refining previous tokens. So if the model actually finds out that the previous part does not make sense, it does not do that annoying "I incorrectly classified X", but it will just repair it (as long as this mistake is in the same generating block). But also the fact that if you are generating block of size 256 with 16 steps, you get 16-times less forward passes (but on a more data).

So I decided to start playing with diffusion for text to see how it goes. I cloned github repo from Bottlecap https://github.com/BottleCapAI/NoCap-Test where they use nano-GPT-like transformer for a fixed dataset. My goal was to train a diffusion model that can be on-par with this transformer.

Diffusion models require fixed output when denoising the data, but that is often problem in natural language setting, as we do not know whether the response shouldn't be longer. As such you still need to do Diffusion-auto-regressive hybrids. I think I have done the most common (and logical) way for this approach. When generating block N, each token in that block attends to every other token in that same block, but also to every token from preceeding blocks. You can think of it as the block is doing the usual attention to the previous words, but inside the block, you do the bidirectional transformer (BERT style). One more thing with discrete diffusion is that the noise in this sense is represented by a mask token.

The training I have used is quite similar to the BD3-LM. It takes the sequence, separates it into the blocks. For each block it samples a noise between [t_min, 1]. Then based on the sampled noise, it transforms the tokens into <MASK> proportionally  to the sampled noise (so for noise = 1, it transforms all to mask, for noise = 0.5 it transforms half of them). Then the block attends to the previous clean blocks. This already showed it's first problems that I didn't think of, which is that it requires each sequence to be stored twice (original and noisy), which effectively halves the batch-size, so it serve as yet another slowdown of the whole algorithm.

When I run the autoregressive model on the cluster using single A100, it took 3 hours to finish the default 4768 iterations. When I ran the diffusion model, it took 24 hours to do 3000 iterations. So the slowdown is substantial. But what is even worse, the rat at which the loss goes down is actually slower for the diffusion model. Can this be even worse? Is the diffusion really that bad?