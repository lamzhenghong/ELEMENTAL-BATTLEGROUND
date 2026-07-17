import cv2
import numpy as np
import os
import sys

# Paths
input_path = r"C:\Users\lamzh\OneDrive\Documents\Games\ELEMENTAL BATTLEGROUND\assets\kling_20260717_VIDEO_A_10_secon_5739_0.mp4"
output_path = r"C:\Users\lamzh\OneDrive\Documents\AI\rpg game\assets\main_menu_bg.mp4"

# Check if input exists
if not os.path.exists(input_path):
    print(f"Error: Input file not found at {input_path}")
    sys.exit(1)

# Open video
cap = cv2.VideoCapture(input_path)
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

print(f"FPS: {fps}, Size: {width}x{height}, Total Frames: {total_frames}")

frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

N = len(frames)
if N < 30:
    print("Video too short to loop.")
    sys.exit(1)

# Crossfade over 1 second (approx 30 frames at 30fps)
crossfade_len = int(min(30, N * 0.2))
print(f"Crossfading over {crossfade_len} frames")

# Create blended sequence of length crossfade_len
blended = []
for i in range(crossfade_len):
    alpha = i / (crossfade_len - 1)
    # Blend last frames with first frames
    f1 = frames[N - crossfade_len + i]
    f2 = frames[i]
    blended_frame = cv2.addWeighted(f1, 1 - alpha, f2, alpha, 0)
    blended.append(blended_frame)

# The seamless single loop frame sequence is:
# Blended transition + middle frames
single_loop = blended + frames[crossfade_len : N - crossfade_len]
loop_len = len(single_loop)

# To make it ~10 seconds, we repeat this single loop sequence
target_duration_sec = 10.0
target_frames = int(target_duration_sec * fps)
repeats = int(np.ceil(target_frames / loop_len))

final_frames = []
for _ in range(repeats):
    final_frames.extend(single_loop)

# Trim to exact target length
final_frames = final_frames[:target_frames]

# Save video
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
# Ensure assets folder exists
os.makedirs(os.path.dirname(output_path), exist_ok=True)
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
for f in final_frames:
    out.write(f)
out.release()

print("Seamless loop video generated successfully at:", output_path)
