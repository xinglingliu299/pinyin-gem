"""
拼音魔法公主 - 音频生成脚本 V2
使用 edge-tts (Microsoft Neural TTS) 重新生成全部音频
改进点：
  1. 拼音和例字用 -20% 缓速，发音更清晰
  2. 声母字母用 -30% 极慢速突出辅音
  3. 所有文本带延音符号，避免 TTS 吞音
  4. 保持原有文件命名，可直接覆盖旧文件
"""
import asyncio
import edge_tts
import os
import sys

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio')
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "zh-CN-XiaoxiaoNeural"

# ── 所有音频条目 ──
# (文件名, 朗读文本, 语速)
# 语速: "" 正常, "-20%" 慢速, "-30%" 极慢

ITEMS = []

# ===== 54个关卡的拼音发音 =====
PINYIN = [
    # 单韵母
    ("pinyin_a", "啊——", "-20%"), ("pinyin_o", "哦——", "-20%"), ("pinyin_e", "鹅——", "-20%"),
    ("pinyin_i", "衣——", "-20%"), ("pinyin_u", "乌——", "-20%"), ("pinyin_v", "鱼——", "-20%"),
    # 声母
    ("pinyin_b", "bō", "-20%"), ("pinyin_p", "pō", "-20%"), ("pinyin_m", "mō", "-20%"), ("pinyin_f", "fō", "-20%"),
    ("pinyin_d", "dē", "-20%"), ("pinyin_t", "tē", "-20%"), ("pinyin_n", "nē", "-20%"), ("pinyin_l", "lē", "-20%"),
    ("pinyin_g", "gē", "-20%"), ("pinyin_k", "kē", "-20%"), ("pinyin_h", "hē", "-20%"),
    ("pinyin_j", "jī", "-20%"), ("pinyin_q", "qī", "-20%"), ("pinyin_x", "xī", "-20%"),
    ("pinyin_zh", "zhī", "-20%"), ("pinyin_ch", "chī", "-20%"), ("pinyin_sh", "shī", "-20%"), ("pinyin_r", "rì", "-20%"),
    ("pinyin_z", "zī", "-20%"), ("pinyin_c", "cī", "-20%"), ("pinyin_s", "sī", "-20%"),
    ("pinyin_y", "yī", "-20%"), ("pinyin_w", "wū", "-20%"),
    # 复韵母+鼻韵母
    ("pinyin_ai", "āi", "-20%"), ("pinyin_ei", "ēi", "-20%"), ("pinyin_ui", "uī", "-20%"),
    ("pinyin_ao", "āo", "-20%"), ("pinyin_ou", "ōu", "-20%"), ("pinyin_iu", "iū", "-20%"),
    ("pinyin_ie", "iē", "-20%"), ("pinyin_ve", "üē", "-20%"), ("pinyin_er", "ér", "-20%"),
    ("pinyin_an", "ān", "-20%"), ("pinyin_en", "ēn", "-20%"), ("pinyin_in", "yīn", "-20%"),
    ("pinyin_ang", "āng", "-20%"), ("pinyin_eng", "ēng", "-20%"),
    # 整体认读音节
    ("pinyin_zhi", "zhī", "-20%"), ("pinyin_chi", "chī", "-20%"), ("pinyin_shi", "shī", "-20%"),
    ("pinyin_ri", "rì", "-20%"), ("pinyin_zi2", "zì", "-20%"), ("pinyin_ci", "cí", "-20%"),
    ("pinyin_si", "sī", "-20%"), ("pinyin_yi", "yī", "-20%"), ("pinyin_wu", "wú", "-20%"),
    ("pinyin_yu2", "yǔ", "-20%"), ("pinyin_ye", "yè", "-20%"),
]
ITEMS.extend(PINYIN)

# ===== 例字发音 =====
EXAMPLES = [
    ("ex_a", "啊", "-20%"), ("ex_o", "哦", "-20%"), ("ex_e", "鹅", "-20%"),
    ("ex_i", "衣", "-20%"), ("ex_u", "屋", "-20%"), ("ex_v", "鱼", "-20%"),
    ("ex_b", "波", "-20%"), ("ex_p", "泼", "-20%"), ("ex_m", "摸", "-20%"), ("ex_f", "佛", "-20%"),
    ("ex_d", "大", "-20%"), ("ex_t", "特", "-20%"), ("ex_n", "那", "-20%"), ("ex_l", "拉", "-20%"),
    ("ex_g", "哥", "-20%"), ("ex_k", "蝌", "-20%"), ("ex_h", "喝", "-20%"),
    ("ex_j", "鸡", "-20%"), ("ex_q", "七", "-20%"), ("ex_x", "西", "-20%"),
    ("ex_zh", "蜘蛛", "-20%"), ("ex_ch", "吃饭", "-20%"), ("ex_sh", "狮子", "-20%"), ("ex_r", "日出", "-20%"),
    ("ex_z", "字", "-20%"), ("ex_c", "刺", "-20%"), ("ex_s", "丝", "-20%"),
    ("ex_y", "一", "-20%"), ("ex_w", "乌", "-20%"),
    ("ex_ai", "爱", "-20%"), ("ex_ei", "飞", "-20%"), ("ex_ui", "归", "-20%"),
    ("ex_ao", "猫", "-20%"), ("ex_ou", "狗", "-20%"), ("ex_iu", "牛", "-20%"),
    ("ex_ie", "写", "-20%"), ("ex_ve", "月", "-20%"), ("ex_er", "耳", "-20%"),
    ("ex_an", "天", "-20%"), ("ex_en", "门", "-20%"), ("ex_in", "林", "-20%"),
    ("ex_ang", "羊", "-20%"), ("ex_eng", "风", "-20%"),
    ("ex_zhi", "蜘蛛", "-20%"), ("ex_chi", "吃饭", "-20%"), ("ex_shi", "狮子", "-20%"),
    ("ex_ri", "日出", "-20%"), ("ex_zi", "写字", "-20%"), ("ex_ci", "瓷碗", "-20%"),
    ("ex_si", "丝瓜", "-20%"), ("ex_yi", "衣服", "-20%"), ("ex_wu", "跳舞", "-20%"),
    ("ex_yu", "下雨", "-20%"), ("ex_ye", "叶子", "-20%"),
]
ITEMS.extend(EXAMPLES)

# ===== 四声发音（声调森林用）=====
TONES = [
    ("tone_a1", "ā", "-20%"), ("tone_a2", "á", "-20%"), ("tone_a3", "ǎ", "-20%"), ("tone_a4", "à", "-20%"),
    ("tone_o1", "ō", "-20%"), ("tone_o2", "ó", "-20%"), ("tone_o3", "ǒ", "-20%"), ("tone_o4", "ò", "-20%"),
    ("tone_e1", "ē", "-20%"), ("tone_e2", "é", "-20%"), ("tone_e3", "ě", "-20%"), ("tone_e4", "è", "-20%"),
    # 单字母声调用汉字代替，TTS 不识别纯拼音文本
    ("tone_i1", "衣", "-20%"), ("tone_i2", "姨", "-20%"), ("tone_i3", "椅", "-20%"), ("tone_i4", "意", "-20%"),
    ("tone_u1", "乌", "-20%"), ("tone_u2", "吴", "-20%"), ("tone_u3", "五", "-20%"), ("tone_u4", "物", "-20%"),
    ("tone_v1", "淤", "-20%"), ("tone_v2", "鱼", "-20%"), ("tone_v3", "雨", "-20%"), ("tone_v4", "玉", "-20%"),
]
ITEMS.extend(TONES)

# ===== 游戏专用音频 =====
GAMES = [
    ("game_ba", "bā", "-20%"), ("game_ma", "mā", "-20%"), ("game_da", "dà", "-20%"),
    ("game_ge", "gē", "-20%"), ("game_ji", "jī", "-20%"), ("game_zhi2", "zhī", "-20%"),
    ("game_he", "hē", "-20%"), ("game_yi2", "yī", "-20%"), ("game_wu2", "wū", "-20%"),
    ("game_yu3", "yǔ", "-20%"),
]
ITEMS.extend(GAMES)

# ===== 快闪认读音频 =====
FLASH = [
    ("flash_b", "波", "-20%"), ("flash_p", "泼", "-20%"), ("flash_m", "摸", "-20%"),
    ("flash_f", "佛", "-20%"), ("flash_d", "得", "-20%"), ("flash_t", "特", "-20%"),
    ("flash_n", "呢", "-20%"), ("flash_g", "哥", "-20%"), ("flash_k", "科", "-20%"),
    ("flash_h", "喝", "-20%"),
]
ITEMS.extend(FLASH)

# ===== 字母独立发音（两步学习法用）=====
# 单韵母和复韵母用正常语速，声母用极慢语速突出辅音本音
LETTERS = [
    # 单韵母
    ("letter_a", "啊——", "-20%"), ("letter_o", "哦——", "-20%"), ("letter_e", "鹅——", "-20%"),
    ("letter_i", "衣——", "-20%"), ("letter_u", "乌——", "-20%"), ("letter_v", "鱼——", "-20%"),
    # 声母（极慢）
    ("letter_b", "玻", "-30%"), ("letter_p", "坡", "-30%"), ("letter_m", "摸", "-30%"), ("letter_f", "佛", "-30%"),
    ("letter_d", "得", "-30%"), ("letter_t", "特", "-30%"), ("letter_n", "呢", "-30%"), ("letter_l", "勒", "-30%"),
    ("letter_g", "哥", "-30%"), ("letter_k", "科", "-30%"), ("letter_h", "喝", "-30%"),
    ("letter_j", "鸡", "-30%"), ("letter_q", "七", "-30%"), ("letter_x", "西", "-30%"),
    ("letter_zh", "知", "-30%"), ("letter_ch", "吃", "-30%"), ("letter_sh", "诗", "-30%"), ("letter_r", "日", "-30%"),
    ("letter_z", "资", "-30%"), ("letter_c", "次", "-30%"), ("letter_s", "思", "-30%"),
    ("letter_y", "衣", "-30%"), ("letter_w", "乌", "-30%"),
    # 复韵母+鼻韵母
    ("letter_ai", "爱", "-20%"), ("letter_ei", "诶", "-20%"), ("letter_ui", "威", "-20%"),
    ("letter_ao", "熬", "-20%"), ("letter_ou", "欧", "-20%"), ("letter_iu", "优", "-20%"),
    ("letter_ie", "耶", "-20%"), ("letter_ve", "约", "-20%"), ("letter_er", "耳", "-20%"),
    ("letter_an", "安", "-20%"), ("letter_en", "恩", "-20%"), ("letter_in", "因", "-20%"),
    ("letter_ang", "昂", "-20%"), ("letter_eng", "鞥", "-20%"),
    # 整体认读音节
    ("letter_zhi", "织", "-20%"), ("letter_chi", "吃", "-20%"), ("letter_shi", "狮", "-20%"),
    ("letter_ri", "日", "-20%"), ("letter_zi", "字", "-20%"), ("letter_ci", "瓷", "-20%"),
    ("letter_si", "丝", "-20%"), ("letter_yi", "衣", "-20%"), ("letter_wu", "无", "-20%"),
    ("letter_yu", "雨", "-20%"), ("letter_ye", "夜", "-20%"),
]
ITEMS.extend(LETTERS)


async def generate_one(name: str, text: str, rate: str):
    """生成单条音频，覆盖已存在"""
    output_path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
    try:
        communicate = edge_tts.Communicate(text, VOICE, rate=rate)
        await communicate.save(output_path)
        return True
    except Exception as e:
        print(f"  ERROR {name}: {e}")
        return False


async def main():
    total = len(ITEMS)
    print(f"开始重新生成 {total} 条音频...")
    print(f"声音: {VOICE}")
    print()

    success = 0
    failed = 0

    for idx, (name, text, rate) in enumerate(ITEMS, 1):
        result = await generate_one(name, text, rate)
        if result:
            success += 1
            rate_str = f" ({rate})" if rate else ""
            print(f"  [{idx}/{total}] OK: {name} = '{text}'{rate_str}")
        else:
            failed += 1
            print(f"  [{idx}/{total}] FAIL: {name}")

    print()
    print(f"完成! 生成: {success}, 失败: {failed}")
    total_size = sum(
        os.path.getsize(os.path.join(OUTPUT_DIR, f))
        for f in os.listdir(OUTPUT_DIR) if f.endswith('.mp3') and not f.startswith('test_')
    )
    print(f"音频文件总大小: {total_size / 1024:.1f} KB ({total_size / 1024 / 1024:.2f} MB)")


if __name__ == "__main__":
    asyncio.run(main())
