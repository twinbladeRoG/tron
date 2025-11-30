#!/usr/bin/env bash

SESSION="tars"

tmux has-session -t "$SESSION" 2>/dev/null && tmux kill-session -t "$SESSION"

tmux new-session -d -s "$SESSION" -n main

tmux split-window -h -t "$SESSION":1
tmux split-window -v -t "$SESSION":1.1
tmux split-window -v -t "$SESSION":1.2
tmux split-window -v -p 70 -t "$SESSION":1.4

tmux send-keys -t "$SESSION":1.1 "pnpm -F api docker:up && source ./apps/api/.venv/bin/activate && pnpm -F api dev" C-m
tmux send-keys -t "$SESSION":1.2 "source ./apps/api/.venv/bin/activate && pnpm -F api celery:flower" C-m
tmux send-keys -t "$SESSION":1.3 "pnpm -F web dev" C-m
tmux send-keys -t "$SESSION":1.4 "nvtop" C-m
tmux send-keys -t "$SESSION":1.5 "btop" C-m

tmux attach-session -t "$SESSION"
