#!/bin/bash
SESSION="bey-airlines"
DIR="$HOME/Desktop/Projeler/Web Siteler/Bey_Airlines"
CMD_OPUS="claude --dangerously-skip-permissions --model claude-opus-4-6"
CMD_SONNET="claude --dangerously-skip-permissions --model claude-sonnet-4-6"

# Eski session'ı kapat
tmux kill-session -t "$SESSION" 2>/dev/null

# Yeni session oluştur (sol ana pane - takım lideri)
tmux new-session -d -s "$SESSION" -c "$DIR" -n "Bey Airlines Team"

# Sağ taraf için yatay böl (%60 sağ)
tmux split-window -h -t "$SESSION:0.0" -c "$DIR" -p 60

# Sağ pane'i 6 eşit parçaya böl
tmux split-window -v -t "$SESSION:0.1" -c "$DIR" -p 83
tmux split-window -v -t "$SESSION:0.2" -c "$DIR" -p 80
tmux split-window -v -t "$SESSION:0.3" -c "$DIR" -p 75
tmux split-window -v -t "$SESSION:0.4" -c "$DIR" -p 67
tmux split-window -v -t "$SESSION:0.5" -c "$DIR" -p 50

# Mouse desteği
tmux set -t "$SESSION" mouse on

# Her pane'e user-defined option ile isim ver (Claude Code bunu ezemiyor)
tmux set-option -p -t "$SESSION:0.0" @label "TAKIM-LIDERI"
tmux set-option -p -t "$SESSION:0.1" @label "BACKEND-DEV"
tmux set-option -p -t "$SESSION:0.2" @label "FRONTEND-DEV"
tmux set-option -p -t "$SESSION:0.3" @label "KALITE-TEST"
tmux set-option -p -t "$SESSION:0.4" @label "HIZLI-FIX"
tmux set-option -p -t "$SESSION:0.5" @label "UI-DESIGNER"
tmux set-option -p -t "$SESSION:0.6" @label "GENEL-CLAUDE"

# Pane border'da @label göster
tmux set -t "$SESSION" pane-border-status top
tmux set -t "$SESSION" pane-border-style "fg=colour240"
tmux set -t "$SESSION" pane-active-border-style "fg=colour196,bold"
tmux set -t "$SESSION" pane-border-format " #[bold,fg=colour214]#{@label} "

# Claude başlat
tmux send-keys -t "$SESSION:0.0" "$CMD_OPUS --agent takım-lideri" Enter
tmux send-keys -t "$SESSION:0.1" "$CMD_SONNET --agent backend-dev" Enter
tmux send-keys -t "$SESSION:0.2" "$CMD_SONNET --agent frontend-dev" Enter
tmux send-keys -t "$SESSION:0.3" "$CMD_SONNET --agent kalite-test" Enter
tmux send-keys -t "$SESSION:0.4" "$CMD_SONNET --agent hizli-fix" Enter
tmux send-keys -t "$SESSION:0.5" "$CMD_SONNET --agent ui-designer" Enter
tmux send-keys -t "$SESSION:0.6" "$CMD_SONNET" Enter

# Ana pane'e dön
tmux select-pane -t "$SESSION:0.0"

# Attach
tmux attach -t "$SESSION"
