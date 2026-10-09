import re
import json

with open('scripts/all_pages_by_column.txt') as f:
    raw_col_text = f.read()

with open('scripts/ans_key_2026_series_a.json') as f:
    ans_key = json.load(f)

# Column mapping: (page, col) -> [list of question numbers]
col_map = {
    (3, 'LEFT'): [1, 2, 3],
    (3, 'RIGHT'): [4, 5, 6],
    (5, 'LEFT'): [7, 8],
    (5, 'RIGHT'): [9, 10],
    (7, 'LEFT'): [11, 12, 13],
    (7, 'RIGHT'): [14, 15],
    (9, 'LEFT'): [16, 17],
    (9, 'RIGHT'): [18, 19, 20],
    (11, 'LEFT'): [21],
    (11, 'RIGHT'): [22, 23],
    (13, 'LEFT'): [24, 25],
    (13, 'RIGHT'): [26, 27],
    (15, 'LEFT'): [28, 29, 30],
    (15, 'RIGHT'): [31, 32],
    (17, 'LEFT'): [33, 34],
    (17, 'RIGHT'): [35],
    (19, 'LEFT'): [36, 37],
    (19, 'RIGHT'): [38, 39, 40],
    (21, 'LEFT'): [41, 42],
    (21, 'RIGHT'): [43, 44],
    (23, 'LEFT'): [45, 46],
    (23, 'RIGHT'): [47, 48],
    (25, 'LEFT'): [49, 50],
    (25, 'RIGHT'): [51],
    (27, 'LEFT'): [52],
    (27, 'RIGHT'): [53],
    (29, 'LEFT'): [54, 55],
    (29, 'RIGHT'): [56],
    (31, 'LEFT'): [57, 58],
    (31, 'RIGHT'): [59, 60],
    (33, 'LEFT'): [61, 62],
    (33, 'RIGHT'): [63],
    (35, 'LEFT'): [64, 65],
    (35, 'RIGHT'): [66, 67],
    (37, 'LEFT'): [68, 69],
    (37, 'RIGHT'): [70, 71],
    (39, 'LEFT'): [72, 73],
    (39, 'RIGHT'): [74, 75],
    (41, 'LEFT'): [76],
    (41, 'RIGHT'): [77],
    (43, 'LEFT'): [78, 79],
    (43, 'RIGHT'): [80, 81],
    (45, 'LEFT'): [82, 83],
    (45, 'RIGHT'): [84, 85],
    (47, 'LEFT'): [86, 87, 88],
    (47, 'RIGHT'): [89, 90, 91],
    (49, 'LEFT'): [92, 93, 94],
    (49, 'RIGHT'): [95, 96],
    (51, 'LEFT'): [97, 98],
    (51, 'RIGHT'): [99, 100],
}

# Parse sections
sections = raw_col_text.split('=== PAGE ')
col_texts = {}
for s in sections[1:]:
    header = s.split('===')[0].strip()
    content = s.split('===')[1].strip()
    parts = header.split()
    page_num = int(parts[0])
    col_side = parts[1]
    col_texts[(page_num, col_side)] = content

print(f"Loaded {len(col_texts)} columns.")
