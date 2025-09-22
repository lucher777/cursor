#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高级代码压缩工具
支持配置文件、多种压缩选项、备份功能
"""

import os
import re
import json
import shutil
import argparse
from pathlib import Path
from datetime import datetime

class AdvancedCodeCompressor:
    def __init__(self, config_file='compress_config.json'):
        self.config = self.load_config(config_file)
        self.stats = {
            'html': {'original': 0, 'compressed': 0, 'files': 0, 'saved': 0},
            'css': {'original': 0, 'compressed': 0, 'files': 0, 'saved': 0},
            'js': {'original': 0, 'compressed': 0, 'files': 0, 'saved': 0},
            'other': {'original': 0, 'compressed': 0, 'files': 0, 'saved': 0}
        }
        
    def load_config(self, config_file):
        """加载配置文件"""
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"⚠️  配置文件 {config_file} 不存在，使用默认配置")
            return self.get_default_config()
        except json.JSONDecodeError as e:
            print(f"❌ 配置文件格式错误: {e}")
            return self.get_default_config()
    
    def get_default_config(self):
        """获取默认配置"""
        return {
            "compression_settings": {
                "html": {"enabled": True, "remove_comments": True, "remove_whitespace": True},
                "css": {"enabled": True, "remove_comments": True, "remove_whitespace": True},
                "js": {"enabled": True, "remove_comments": True, "remove_whitespace": True}
            },
            "file_settings": {
                "skip_patterns": ["node_modules", ".git", "__pycache__", "compressed", "*.min.*"],
                "binary_extensions": [".jpg", ".png", ".gif", ".ico", ".pdf", ".zip"]
            },
            "output_settings": {
                "default_output_dir": "compressed",
                "preserve_structure": True,
                "create_backup": False
            }
        }
    
    def compress_html(self, content):
        """压缩HTML代码"""
        if not self.config['compression_settings']['html']['enabled']:
            return content
        
        settings = self.config['compression_settings']['html']
        
        # 删除HTML注释
        if settings.get('remove_comments', True):
            content = re.sub(r'<!--(?!\[if).*?-->', '', content, flags=re.DOTALL)
        
        # 压缩空白符
        if settings.get('remove_whitespace', True):
            # 保留特殊标签内的空白
            preserve_tags = settings.get('preserve_tags', ['pre', 'textarea', 'script', 'style'])
            preserved_blocks = []
            
            for tag in preserve_tags:
                pattern = rf'<{tag}[^>]*>.*?</{tag}>'
                
                def preserve_block(match):
                    preserved_blocks.append(match.group(0))
                    return f'__PRESERVE_BLOCK_{len(preserved_blocks)-1}__'
                
                content = re.sub(pattern, preserve_block, content, flags=re.DOTALL | re.IGNORECASE)
            
            # 压缩空白符
            content = re.sub(r'\s+', ' ', content)
            content = re.sub(r'>\s+<', '><', content)
            content = re.sub(r'^\s+|\s+$', '', content, flags=re.MULTILINE)
            
            # 恢复保留的块
            for i, block in enumerate(preserved_blocks):
                content = content.replace(f'__PRESERVE_BLOCK_{i}__', block)
        
        return content.strip()
    
    def compress_css(self, content):
        """压缩CSS代码"""
        if not self.config['compression_settings']['css']['enabled']:
            return content
        
        settings = self.config['compression_settings']['css']
        
        # 删除CSS注释
        if settings.get('remove_comments', True):
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # 压缩空白符
        if settings.get('remove_whitespace', True):
            content = re.sub(r'\s+', ' ', content)
            content = re.sub(r'{\s*', '{', content)
            content = re.sub(r'}\s*', '}', content)
            content = re.sub(r':\s*', ':', content)
            content = re.sub(r';\s*', ';', content)
            content = re.sub(r',\s*', ',', content)
            content = re.sub(r';\s*}', '}', content)
            content = re.sub(r'^\s+|\s+$', '', content, flags=re.MULTILINE)
        
        return content.strip()
    
    def compress_js(self, content):
        """压缩JavaScript代码"""
        if not self.config['compression_settings']['js']['enabled']:
            return content
        
        settings = self.config['compression_settings']['js']
        
        # 删除注释
        if settings.get('remove_comments', True):
            # 保留字符串和正则表达式
            preserved_strings = []
            
            # 保留字符串
            def preserve_string(match):
                preserved_strings.append(match.group(0))
                return f'__STRING_{len(preserved_strings)-1}__'
            
            # 匹配字符串
            content = re.sub(r'"(?:[^"\\]|\\.)*"', preserve_string, content)
            content = re.sub(r"'(?:[^'\\]|\\.)*'", preserve_string, content)
            content = re.sub(r'`(?:[^`\\]|\\.)*`', preserve_string, content)
            
            # 删除单行注释
            content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
            
            # 删除多行注释
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
            
            # 恢复字符串
            for i, string in enumerate(preserved_strings):
                content = content.replace(f'__STRING_{i}__', string)
        
        # 压缩空白符
        if settings.get('remove_whitespace', True):
            content = re.sub(r'\n\s*\n', '\n', content)  # 删除空行
            content = re.sub(r'^\s+', '', content, flags=re.MULTILINE)  # 删除行首空白
        
        return content.strip()
    
    def should_skip_file(self, file_path):
        """检查是否应该跳过文件"""
        skip_patterns = self.config['file_settings']['skip_patterns']
        file_str = str(file_path)
        
        for pattern in skip_patterns:
            if '*' in pattern:
                # 通配符匹配
                import fnmatch
                if fnmatch.fnmatch(file_path.name, pattern):
                    return True
            else:
                if pattern in file_str:
                    return True
        
        return False
    
    def is_binary_file(self, file_path):
        """检查是否为二进制文件"""
        binary_extensions = self.config['file_settings']['binary_extensions']
        return file_path.suffix.lower() in binary_extensions
    
    def create_backup(self, source_dir):
        """创建备份"""
        if not self.config['output_settings'].get('create_backup', False):
            return None
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = Path(f"backup_{timestamp}")
        
        print(f"📦 创建备份到: {backup_dir}")
        shutil.copytree(source_dir, backup_dir)
        return backup_dir
    
    def compress_file(self, file_path):
        """压缩单个文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
        except (UnicodeDecodeError, PermissionError):
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
            compressed_content = original_content
            file_type = 'other'
        
        compressed_size = len(compressed_content)
        saved_size = original_size - compressed_size
        
        # 更新统计
        self.stats[file_type]['original'] += original_size
        self.stats[file_type]['compressed'] += compressed_size
        self.stats[file_type]['saved'] += saved_size
        self.stats[file_type]['files'] += 1
        
        return compressed_content, (original_size, compressed_size, saved_size)
    
    def compress_directory(self, source_dir, output_dir):
        """压缩目录"""
        source_path = Path(source_dir)
        output_path = Path(output_dir)
        
        print(f"🗜️  开始压缩: {source_path.absolute()}")
        print(f"📁 输出目录: {output_path.absolute()}")
        print("=" * 80)
        
        # 创建备份
        backup_dir = self.create_backup(source_path)
        
        # 创建输出目录
        if output_path.exists():
            shutil.rmtree(output_path)
        output_path.mkdir(parents=True)
        
        # 遍历文件
        processed_files = 0
        for file_path in source_path.rglob('*'):
            if file_path.is_file() and not self.should_skip_file(file_path):
                rel_path = file_path.relative_to(source_path)
                output_file = output_path / rel_path
                output_file.parent.mkdir(parents=True, exist_ok=True)
                
                if self.is_binary_file(file_path):
                    # 复制二进制文件
                    shutil.copy2(file_path, output_file)
                    size = file_path.stat().st_size
                    self.stats['other']['original'] += size
                    self.stats['other']['compressed'] += size
                    self.stats['other']['files'] += 1
                    print(f"📄 {rel_path}: 已复制 ({size:,} bytes)")
                else:
                    # 压缩文本文件
                    result = self.compress_file(file_path)
                    if result[0] is not None:
                        compressed_content, sizes = result
                        
                        with open(output_file, 'w', encoding='utf-8') as f:
                            f.write(compressed_content)
                        
                        original_size, compressed_size, saved_size = sizes
                        reduction = (saved_size / original_size * 100) if original_size > 0 else 0
                        
                        if saved_size > 0:
                            print(f"✅ {rel_path}: {original_size:,} → {compressed_size:,} bytes (-{reduction:.1f}%)")
                        else:
                            print(f"📄 {rel_path}: {original_size:,} bytes (无压缩)")
                
                processed_files += 1
        
        print(f"\n✨ 处理完成！共处理 {processed_files} 个文件")
        if backup_dir:
            print(f"📦 备份保存在: {backup_dir}")
    
    def print_summary(self):
        """打印统计报告"""
        print("\n" + "=" * 80)
        print("📊 压缩统计报告")
        print("=" * 80)
        
        total_original = sum(stats['original'] for stats in self.stats.values())
        total_compressed = sum(stats['compressed'] for stats in self.stats.values())
        total_saved = sum(stats['saved'] for stats in self.stats.values())
        total_files = sum(stats['files'] for stats in self.stats.values())
        
        for file_type, stats in self.stats.items():
            if stats['files'] > 0:
                reduction = (stats['saved'] / stats['original'] * 100) if stats['original'] > 0 else 0
                print(f"{file_type.upper():>6}: {stats['files']:>3} 文件 | "
                      f"{stats['original']:>9,} → {stats['compressed']:>9,} bytes | "
                      f"节省 {stats['saved']:>8,} bytes ({reduction:>5.1f}%)")
        
        print("-" * 80)
        total_reduction = (total_saved / total_original * 100) if total_original > 0 else 0
        print(f"{'总计':>6}: {total_files:>3} 文件 | "
              f"{total_original:>9,} → {total_compressed:>9,} bytes | "
              f"节省 {total_saved:>8,} bytes ({total_reduction:>5.1f}%)")
        
        print(f"\n🎉 压缩完成！总共节省了 {total_saved:,} bytes ({total_reduction:.1f}%)")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='高级代码压缩工具')
    parser.add_argument('source', nargs='?', default='.', help='源目录路径')
    parser.add_argument('output', nargs='?', default='compressed', help='输出目录路径')
    parser.add_argument('-c', '--config', default='compress_config.json', help='配置文件路径')
    parser.add_argument('-b', '--backup', action='store_true', help='创建备份')
    parser.add_argument('-y', '--yes', action='store_true', help='跳过确认')
    
    args = parser.parse_args()
    
    print("🗜️  高级代码压缩工具")
    print("=" * 80)
    
    # 创建压缩器
    compressor = AdvancedCodeCompressor(args.config)
    
    # 设置备份选项
    if args.backup:
        compressor.config['output_settings']['create_backup'] = True
    
    # 显示配置信息
    print(f"📂 源目录: {Path(args.source).absolute()}")
    print(f"📂 输出目录: {Path(args.output).absolute()}")
    print(f"⚙️  配置文件: {args.config}")
    
    # 确认操作
    if not args.yes:
        confirm = input("\n确认开始压缩？(y/N): ").strip().lower()
        if confirm not in ['y', 'yes']:
            print("❌ 操作已取消")
            return
    
    # 开始压缩
    try:
        compressor.compress_directory(args.source, args.output)
        compressor.print_summary()
    except KeyboardInterrupt:
        print("\n⚠️  操作被用户中断")
    except Exception as e:
        print(f"\n❌ 压缩过程中发生错误: {e}")


if __name__ == '__main__':
    main()