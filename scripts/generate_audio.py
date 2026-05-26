"""
拼音魔法公主 - 音频生成脚本
使用 edge-tts (Microsoft Neural TTS) 生成高质量中文发音
"""
import asyncio
import edge_tts
import os
import sys

# 输出目录
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 使用 Xiaoxiao 声音 - 微软最自然的中文女声
VOICE = "zh-CN-XiaoxiaoNeural"

# 所有需要生成音频的内容
# 格式: (文件名, 要朗读的文本)
# 文件名会存为 {name}.mp3

AUDIO_ITEMS = []

# ── 54个关卡的拼音发音 ──
LEVELS = [
    # 第一阶段：单韵母
    ("pinyin_a", "阿"), ("pinyin_o", "哦"), ("pinyin_e", "鹅"),
    ("pinyin_i", "衣"), ("pinyin_u", "乌"), ("pinyin_v", "鱼"),
    # 第二阶段：声母
    ("pinyin_b", "波"), ("pinyin_p", "泼"), ("pinyin_m", "摸"), ("pinyin_f", "佛"),
    ("pinyin_d", "得"), ("pinyin_t", "特"), ("pinyin_n", "呢"), ("pinyin_l", "勒"),
    ("pinyin_g", "哥"), ("pinyin_k", "科"), ("pinyin_h", "喝"),
    ("pinyin_j", "鸡"), ("pinyin_q", "七"), ("pinyin_x", "西"),
    ("pinyin_zh", "知"), ("pinyin_ch", "吃"), ("pinyin_sh", "诗"), ("pinyin_r", "日"),
    ("pinyin_z", "资"), ("pinyin_c", "次"), ("pinyin_s", "思"),
    ("pinyin_y", "衣"), ("pinyin_w", "乌"),
    # 第三阶段：复韵母+鼻韵母
    ("pinyin_ai", "爱"), ("pinyin_ei", "诶"), ("pinyin_ui", "威"),
    ("pinyin_ao", "熬"), ("pinyin_ou", "欧"), ("pinyin_iu", "优"),
    ("pinyin_ie", "耶"), ("pinyin_ve", "约"), ("pinyin_er", "耳"),
    ("pinyin_an", "安"), ("pinyin_en", "恩"), ("pinyin_in", "因"),
    ("pinyin_ang", "昂"), ("pinyin_eng", "鞥"),
    # 第四阶段：整体认读音节
    ("pinyin_zhi", "织"), ("pinyin_chi", "吃"), ("pinyin_shi", "狮"),
    ("pinyin_ri", "日"), ("pinyin_zi2", "字"), ("pinyin_ci", "瓷"),
    ("pinyin_si", "丝"), ("pinyin_yi", "衣"), ("pinyin_wu", "无"),
    ("pinyin_yu2", "鱼"), ("pinyin_ye", "夜"),
]
AUDIO_ITEMS.extend(LEVELS)

# ── 54个关卡的例字发音 ──
EXAMPLES = [
    # 第一阶段：单韵母
    ("ex_a", "啊"), ("ex_o", "哦"), ("ex_e", "鹅"),
    ("ex_i", "衣"), ("ex_u", "屋"), ("ex_v", "鱼"),
    # 第二阶段：声母
    ("ex_b", "波"), ("ex_p", "泼"), ("ex_m", "摸"), ("ex_f", "佛"),
    ("ex_d", "大"), ("ex_t", "特"), ("ex_n", "那"), ("ex_l", "拉"),
    ("ex_g", "哥"), ("ex_k", "蝌"), ("ex_h", "喝"),
    ("ex_j", "鸡"), ("ex_q", "七"), ("ex_x", "西"),
    ("ex_zh", "蜘"), ("ex_ch", "吃"), ("ex_sh", "狮"), ("ex_r", "日"),
    ("ex_z", "字"), ("ex_c", "刺"), ("ex_s", "丝"),
    ("ex_y", "一"), ("ex_w", "乌"),
    # 第三阶段：复韵母+鼻韵母
    ("ex_ai", "爱"), ("ex_ei", "飞"), ("ex_ui", "归"),
    ("ex_ao", "猫"), ("ex_ou", "狗"), ("ex_iu", "牛"),
    ("ex_ie", "写"), ("ex_ve", "月"), ("ex_er", "耳"),
    ("ex_an", "天"), ("ex_en", "门"), ("ex_in", "林"),
    ("ex_ang", "羊"), ("ex_eng", "风"),
    # 第四阶段：整体认读音节
    ("ex_zhi", "蜘蛛"), ("ex_chi", "吃饭"), ("ex_shi", "狮子"),
    ("ex_ri", "日出"), ("ex_zi", "写字"), ("ex_ci", "瓷碗"),
    ("ex_si", "丝瓜"), ("ex_yi", "衣服"), ("ex_wu", "跳舞"),
    ("ex_yu", "下雨"), ("ex_ye", "叶子"),
]
AUDIO_ITEMS.extend(EXAMPLES)

# ── 6个单韵母的四声发音（声调森林用）──
TONE_VOWELS = [
    # 用典型汉字来体现不同声调，确保发音清晰有差异
    ("tone_a1", "阿"), ("tone_a2", "挨"), ("tone_a3", "矮"), ("tone_a4", "爱"),
    ("tone_o1", "哦"), ("tone_o2", "喔"), ("tone_o3", "偶"), ("tone_o4", "哦"),
    ("tone_e1", "鹅"), ("tone_e2", "额"), ("tone_e3", "恶"), ("tone_e4", "饿"),
    # 用典型汉字来体现不同声调，确保发音清晰有差异
    ("tone_i1", "衣"), ("tone_i2", "姨"), ("tone_i3", "椅"), ("tone_i4", "意"),
    ("tone_u1", "乌"), ("tone_u2", "吴"), ("tone_u3", "五"), ("tone_u4", "物"),
    ("tone_v1", "淤"), ("tone_v2", "鱼"), ("tone_v3", "雨"), ("tone_v4", "玉"),
]
AUDIO_ITEMS.extend(TONE_VOWELS)

# ── 听音配图游戏专用音频 ──
GAME_AUDIO = [
    ("game_ba", "八"), ("game_ma", "妈"), ("game_da", "大"),
    ("game_ge", "歌"), ("game_ji", "鸡"), ("game_zhi2", "知"),
    ("game_he", "喝"), ("game_yi2", "一"), ("game_wu2", "屋"),
    ("game_yu3", "雨"),
]
AUDIO_ITEMS.extend(GAME_AUDIO)

# ── 快闪认读游戏专用 ──
FLASH_AUDIO = [
    ("flash_b", "波"), ("flash_p", "泼"), ("flash_m", "摸"),
    ("flash_f", "佛"), ("flash_d", "得"), ("flash_t", "特"),
    ("flash_n", "呢"), ("flash_g", "哥"), ("flash_k", "科"),
    ("flash_h", "喝"),
]
AUDIO_ITEMS.extend(FLASH_AUDIO)


async def generate_one(name: str, text: str):
    """生成单条音频"""
    output_path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
    if os.path.exists(output_path):
        return  # 跳过已存在的文件
    try:
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(output_path)
        return True
    except Exception as e:
        print(f"  ERROR generating {name}: {e}")
        return False


async def main():
    total = len(AUDIO_ITEMS)
    print(f"开始生成 {total} 条音频...")
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"声音: {VOICE}")
    print()

    success = 0
    skipped = 0
    failed = 0

    for i, (name, text) in enumerate(AUDIO_ITEMS):
        output_path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
        if os.path.exists(output_path):
            skipped += 1
            continue

        result = await generate_one(name, text)
        if result:
            success += 1
            print(f"  [{i+1}/{total}] OK: {name} = '{text}'")
        else:
            failed += 1
            print(f"  [{i+1}/{total}] FAIL: {name}")

    print()
    print(f"完成! 新生成: {success}, 跳过(已存在): {skipped}, 失败: {failed}")

    # 统计文件大小
    total_size = 0
    for f in os.listdir(OUTPUT_DIR):
        if f.endswith('.mp3'):
            total_size += os.path.getsize(os.path.join(OUTPUT_DIR, f))
    print(f"音频文件总大小: {total_size / 1024:.1f} KB ({total_size / 1024 / 1024:.2f} MB)")


if __name__ == "__main__":
    asyncio.run(main())
