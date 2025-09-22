from fastapi import FastAPI, HTTPException
import requests
from typing import Dict, Any

app = FastAPI()

# 模拟管理配置（实际用数据库存储，例如SQLAlchemy模型）
api_configs = {
    "post_api": {
        "enabled": True,
        "required_fields": ["id"],  # 必填字段（验证外部响应）
        "display_fields": ["userId", "id", "title", "custom_field"]  # 只显示这些字段
    }
}

def apply_config(data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    if not config["enabled"]:
        raise HTTPException(status_code=503, detail="API is disabled")
    
    # 验证必填字段
    for field in config["required_fields"]:
        if field not in data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # 添加自定义字段
    data["custom_field"] = "This is my custom value"
    data["another_custom"] = 42
    
    # 过滤显示字段
    filtered_data = {k: v for k, v in data.items() if k in config["display_fields"]}
    return filtered_data

@app.get("/new_api/{item_id}")
def get_item(item_id: int):
    # 从外部API获取
    response = requests.get(f"https://jsonplaceholder.typicode.com/posts/{item_id}")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="External API error")
    
    data = response.json()
    
    # 应用配置
    config = api_configs.get("post_api", {})
    return apply_config(data, config)

# 运行：uvicorn thisfile:app --reload
# 测试：访问 http://localhost:8000/new_api/1，应该返回修改后的JSON