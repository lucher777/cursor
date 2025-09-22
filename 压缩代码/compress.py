#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
代码压缩工具
压缩HTML、CSS、JavaScript文件，减少文件大小，不影响功能
"""

import os
import re
import json
import shutil
from pathlib import Path

class CodeCompressor:
    def __init__(self, source_dir='.', output_dir='compressed'):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.stats = {
            'html': {'original': 0, 'compressed': 0, 'files': 0},
            'css': {'original': 0, 'compressed': 0, 'files': 0},
            'js': {'original': 0, 'compressed': 0, 'files': 0},
            'other': {'original': 0, 'compressed': 0, 'files': 0}
        }
        
    def compress_html(self, content):
        """压缩HTML代码"""
        # 保留重要的空白符，删除不必要的空白
        # 删除HTML注释（但保留条件注释）
        content = re.sub(r'<!--(?!\[if).*?-->', '', content, flags=re.DOTALL)
        
        # 删除多余的空白符，但保留pre、textarea、script标签内的空白
        def preserve_whitespace(match):
            return match.group(0)
        
        # 先标记需要保留空白的标签
        preserved_tags = []
        preserve_pattern = r'<(pre|textarea|script)[^>]*>.*?</\1>'
        
        def mark_preserved(match):
            preserved_tags.append(match.group(0))
            return f'__PRESERVE_{len(preserved_tags)-1}__'
        
        content = re.sub(preserve_pattern, mark_preserved, content, flags=re.DOTALL | re.IGNORECASE)
        
        # 压缩空白符
        content = re.sub(r'\s+', ' ', content)
        content = re.sub(r'>\s+<', '><', content)
        content = re.sub(r'^\s+|\s+$', '', content, flags=re.MULTILINE)
        
        # 恢复保留的标签
        for i, preserved in enumerate(preserved_tags):
            content = content.replace(f'__PRESERVE_{i}__', preserved)
        
        return content.strip()
    
    def compress_css(self, content):
        """压缩CSS代码"""
        # 删除CSS注释
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # 删除多余的空白符
        content = re.sub(r'\s+', ' ', content)
        content = re.sub(r';\s*}', '}', content)
        content = re.sub(r'{\s*', '{', content)
        content = re.sub(r'}\s*', '}', content)
        content = re.sub(r':\s*', ':', content)
        content = re.sub(r';\s*', ';', content)
        content = re.sub(r',\s*', ',', content)
        
        # 删除最后一个分号（在}之前）
        content = re.sub(r';\s*}', '}', content)
        
        # 删除行首行尾空白
        content = re.sub(r'^\s+|\s+$', '', content, flags=re.MULTILINE)
        
        return content.strip()
    
    def compress_js(self, content):
        """压缩JavaScript代码（保守压缩，确保功能不受影响）"""
        # 删除单行注释（但保留URL中的//）
        lines = content.split('\n')
        compressed_lines = []
        
        for line in lines:
            # 检查是否在字符串中
            in_string = False
            string_char = None
            i = 0
            clean_line = ""
            
            while i < len(line):
                char = line[i]
                
                if not in_string:
                    if char in ['"', "'"]:
                        in_string = True
                        string_char = char
                        clean_line += char
                    elif char == '/' and i + 1 < len(line) and line[i + 1] == '/':
                        # 找到注释，检查是否在URL中
                        if 'http' not in line[:i]:
                            break  # 这是注释，忽略后面的内容
                        else:
                            clean_line += char
                    else:
                        clean_line += char
                else:
                    if char == string_char and (i == 0 or line[i-1] != '\\'):
                        in_string = False
                        string_char = None
                    clean_line += char
                
                i += 1
            
            if clean_line.strip():
                compressed_lines.append(clean_line.rstrip())
        
        content = '\n'.join(compressed_lines)
        
        # 删除多行注释
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # 删除多余的空白符（但保留字符串内的空白）
        content = re.sub(r'\n\s*\n', '\n', content)  # 删除空行
        content = re.sub(r'^\s+', '', content, flags=re.MULTILINE)  # 删除行首空白
        
        return content.strip()
    
    def should_skip_file(self, file_path):
        """检查是否应该跳过某个文件"""
        skip_patterns = [
            'node_modules',
            '.git',
            '__pycache__',
            '.pyc',
            'compressed',
            'compress.py'
        ]
        
        file_str = str(file_path)
        return any(pattern in file_str for pattern in skip_patterns)
    
    def compress_file(self, file_path):
        """压缩单个文件"""
        if self.should_skip_file(file_path):
            return None, None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
        except UnicodeDecodeError:
            # 对于二进制文件，直接复制
            return None, None
        
        original_size = len(original_content)
        suffix = file_path.suffix.lower()
        
        if suffix == '.html':
            compressed_content = self.compress_html(original_content)
            file_type = 'html'
        elif suffix == '.css':
            compressed_content = self.compress_css(original_content)
            file_type = 'css'
        elif suffix == '.js':
            compressed_content = self.compress_js(original_content)
            file_type = 'js'
        else:
            # 其他文件类型不压缩，直接复制
            compressed_content = original_content
            file_type = 'other'
        
        compressed_size = len(compressed_content)
        
        # 更新统计信息
        self.stats[file_type]['original'] += original_size
        self.stats[file_type]['compressed'] += compressed_size
        self.stats[file_type]['files'] += 1
        
        return compressed_content, (original_size, compressed_size)
    
    def copy_binary_file(self, src_path, dst_path):
        """复制二进制文件"""
        try:
            shutil.copy2(src_path, dst_path)
            size = src_path.stat().st_size
            self.stats['other']['original'] += size
            self.stats['other']['compressed'] += size
            self.stats['other']['files'] += 1
            return True
        except Exception as e:
            print(f"复制文件失败 {src_path}: {e}")
            return False
    
    def compress_directory(self):
        """压缩整个目录"""
        print(f"🗜️  开始压缩 {self.source_dir} 到 {self.output_dir}")
        print("=" * 60)
        
        # 创建输出目录
        if self.output_dir.exists():
            shutil.rmtree(self.output_dir)
        self.output_dir.mkdir(parents=True)
        
        # 遍历所有文件
        for file_path in self.source_dir.rglob('*'):
            if file_path.is_file() and not self.should_skip_file(file_path):
                # 计算相对路径
                rel_path = file_path.relative_to(self.source_dir)
                output_path = self.output_dir / rel_path
                
                # 创建目录
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                # 压缩文件
                compressed_content, sizes = self.compress_file(file_path)
                
                if compressed_content is not None:
                    # 保存压缩后的文件
                    try:
                        with open(output_path, 'w', encoding='utf-8') as f:
                            f.write(compressed_content)
                        
                        if sizes:
                            original_size, compressed_size = sizes
                            reduction = ((original_size - compressed_size) / original_size * 100) if original_size > 0 else 0
                            print(f"✅ {rel_path}: {original_size:,} → {compressed_size:,} bytes (-{reduction:.1f}%)")
                    except Exception as e:
                        print(f"❌ 保存文件失败 {rel_path}: {e}")
                else:
                    # 复制二进制文件
                    if self.copy_binary_file(file_path, output_path):
                        print(f"📄 {rel_path}: 已复制（二进制文件）")
    
    def print_summary(self):
        """打印压缩统计信息"""
        print("\n" + "=" * 60)
        print("📊 压缩统计报告")
        print("=" * 60)
        
        total_original = 0
        total_compressed = 0
        total_files = 0
        
        for file_type, stats in self.stats.items():
            if stats['files'] > 0:
                original = stats['original']
                compressed = stats['compressed']
                files = stats['files']
                reduction = ((original - compressed) / original * 100) if original > 0 else 0
                
                print(f"{file_type.upper():>8}: {files:>3} 文件 | "
                      f"{original:>8,} → {compressed:>8,} bytes | "
                      f"减少 {reduction:>5.1f}%")
                
                total_original += original
                total_compressed += compressed
                total_files += files
        
        print("-" * 60)
        total_reduction = ((total_original - total_compressed) / total_original * 100) if total_original > 0 else 0
        print(f"{'总计':>8}: {total_files:>3} 文件 | "
              f"{total_original:>8,} → {total_compressed:>8,} bytes | "
              f"减少 {total_reduction:>5.1f}%")
        
        print(f"\n🎉 压缩完成！节省了 {total_original - total_compressed:,} bytes")
        print(f"📁 压缩后的文件保存在: {self.output_dir.absolute()}")


def main():
    """主函数"""
    print("🗜️  代码压缩工具")
    print("=" * 60)
    
    # 获取用户输入
    source = input("请输入源目录路径（默认：当前目录）: ").strip() or '.'
    output = input("请输入输出目录路径（默认：compressed）: ").strip() or 'compressed'
    
    # 确认操作
    print(f"\n📂 源目录: {Path(source).absolute()}")
    print(f"📂 输出目录: {Path(output).absolute()}")
    
    confirm = input("\n确认开始压缩？(y/N): ").strip().lower()
    if confirm not in ['y', 'yes']:
        print("❌ 操作已取消")
        return
    
    # 开始压缩
    compressor = CodeCompressor(source, output)
    compressor.compress_directory()
    compressor.print_summary()


if __name__ == '__main__':
    main()