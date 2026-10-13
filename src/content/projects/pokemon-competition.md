---
title: 'Pokemon competition'
description: 'Kaggle Pokemon TCG AI competition'
pubDate: '2026-10-08'
---

### October 13, 2026
The performance does not seem to get much better even with increased train-time. I simply reused hyperparameters and setting from the Poker experiments. But in Poker I could run 1000 training iterations a minute. Now I do the same in tens of minutes, so the hyperparameters do not directly translate. When I tried to upload to kaggle the previous run with the large model, quite unsurprisingly it sucked pretty bad. I ended up at place 335/343, and based on some evaluation it played as random player. I was actually surprised that there were worse players then this.

I changed that I am not playing with single decks, but I picked 19 archetypes that are popular in PTCG. One might think that using a single deck is sufficient. But if you want to be robust against other decks, you need to do selfplay against other decks. Another hyperparameter change is that I start with target network to have update_rate 1 and gradually I decrease it. I do this, because at the beginning I want to train both the fast and target values (and since they influence each other, it makes sense to pretrain them both). Also when I am evaluating I am using just top 2 actions. I might increase it after better runs. After running the training for 1 hour, you immedietly get better than the random player. I trained couple more hours and submitted the bot. Now I got to place 259/349. That's better, still not quite there, but the training is still improving. Even if I can be quite sure this will not be the best model I can get, maybe I can use it to kickstart other training, to atleast pretrain the critic, because that can take quite a long time.



### October 12, 2026
I have a first run which finished. And it was awful. I scaled the model to be as big as submission allows, which is 10-layer transformer. And the training is painfully slow. I mean 1000 iterations took 2 hours, which is pretty bad. Even with all the speed-ups I have made to the collection part, the main bottleneck is the GPU part. I really appreciate the LLMs more now, because the fact that they can serve millions of users at the same time incredibly fast is very impressive. I have a problem training single model.

It is not surprising that with such a few iterations the gameplay was basically random, so I moved on to decrease the model size and removing the deck-building part. This makes the whole training much quicker and better. I will run it overnight again to see how it goes.

### October 10, 2026
I am working on an implementation, and the game is more complicated than I thought. Mainly because the legal actions differ quite substantially between states. God bless transformers, because this allows me to have actions as tokens, and then predict just single logit for each token, which will then be used for the final probability distribution. I feel like I am overcomplicating the implementation, I hope it will not be a big mess. I think that having knowledge on how the game actually plays would allow me to drop unnecessary information and make everything faster, but I will skip that for now, and see how it goes first.



### October 8, 2026 
Kaggle introduced a challenge where teams should train AI models in Pokemon TCG and then match them against each other. It uses limit pool of cards (roughly 1400) and you are pretty free to do whatever with it. The same competition was already running before, but I did not attend, because I noticed too late, which made me quite sad. Luckily now I caught it at the beginning so I have plenty of time to figure something out. I think I have quite a lot of knowledge about how to train RL to play large games, so I am looking forward to work on this project. My approach would be similar to that of Ataraxos from Sam Sokota (https://www.nature.com/articles/s41586-026-11036-y), whom I have met couple of times, especially during my time at CMU. I will not just redo the Ataraxos as I do not like some decisions he made. But I have started with creating few default things that you would need to do, including V-trace, PPO, MMD etc. 

For my design I decided to split the training into two phases that will alternate. The first part is a single player problem of constructing the deck, second is multiplayer problem of playing well. So I created some initial implementation and I want to profile it on GPU to see what is the bottleneck. I would like to have everything running on GPU, but I am not sure whether there are substantial gains from that. Of course, this is one thing I want to test. I am not sure how difficult logic the Pokemon TCG performs, I know that logic of Hearthstone, which is also TCG, is very complicated and doing it on GPU in Jax, will probably be even slower than doing it in the C++ provided by the competition authors. Also the limit size for the models is ~200Mb, meaning I cannot train crazy large model just to avoid the bottleneck of the CPU-GPU transfer. Maybe I could ask Claude to redo the logic into CUDA, but I am not sure whether this is a good idea.