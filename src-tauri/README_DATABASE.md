# 数据库ORM解决方案

本项目使用 **Diesel ORM** 作为数据库管理方案，通过模型定义管理数据，代码更简洁、类型安全。

## Diesel ORM 优势

### 🚀 类型安全
- 编译时检查SQL查询
- 自动生成类型安全的查询构建器
- 防止SQL注入攻击

### 📝 模型驱动
```rust
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = events)]
pub struct Event {
    pub id: Option<i32>,
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
    pub is_deleted: i32,
}
```

### 🔍 查询构建器
```rust
// 替代原生SQL的查询方式
events
    .filter(is_deleted.eq(0))
    .filter(start_date.ge(now))
    .order(start_date.asc())
    .limit(10)
    .load::<Event>(conn)
```

### 📊 自动迁移
- 版本控制的数据库架构
- 自动运行迁移脚本
- 支持回滚操作

## 时间范围查询优化

### 问题场景
用户查询：1月2号到1月10号
事件数据：1月1号到1月5号

### 解决方案
Diesel ORM中的时间范围查询会找到所有重叠的事件：

```rust
pub fn get_events_by_date_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Vec<Event>, DieselError> {
    events
        .filter(is_deleted.eq(0))
        .filter(
            sql::<diesel::sql_types::Bool>(
                "(start_date >= ? AND start_date <= ?) OR 
                 (end_date >= ? AND end_date <= ?) OR 
                 (start_date <= ? AND end_date >= ?) OR 
                 (start_date >= ? AND end_date <= ?)"
            )
            .bind::<diesel::sql_types::Text, _>(&start_str)
            .bind::<diesel::sql_types::Text, _>(&end_str)
            // ... 更多绑定
        )
        .order(start_date.asc())
        .load::<Event>(conn)
}
```

这个查询会匹配以下情况：
1. 事件开始时间在查询范围内
2. 事件结束时间在查询范围内
3. 事件完全包含查询范围
4. 事件被查询范围完全包含

## 使用方法

### 1. 安装Diesel CLI
```bash
cargo install diesel_cli --no-default-features --features sqlite
```

### 2. 设置数据库
```bash
# 创建迁移
diesel migration generate create_events_table

# 运行迁移
diesel migration run

# 回滚迁移
diesel migration revert
```

### 3. 在代码中使用
```rust
// 创建事件
let new_event = Database::create_new_event_data(
    "会议".to_string(),
    "团队会议".to_string(),
    start_date,
    end_date,
    "#3B82F6".to_string(),
);

let id = db.create_event(&new_event)?;

// 查询事件
let events = db.get_events_by_date_range(start_date, end_date)?;

// 更新事件
let update_data = Database::create_update_event_data(
    Some("新标题".to_string()),
    None,
    None,
    None,
    None,
);
db.update_event(id, &update_data)?;
```

## 性能优化

### 索引策略
```sql
-- 时间查询索引
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_end_date ON events(end_date);
CREATE INDEX idx_events_date_range ON events(start_date, end_date);

-- 搜索索引
CREATE INDEX idx_events_title ON events(title);
CREATE INDEX idx_events_description ON events(description);

-- 软删除索引
CREATE INDEX idx_events_is_deleted ON events(is_deleted);
```

### 连接池
```rust
// 使用Arc<Mutex<Connection>>实现线程安全的连接管理
pub struct Database {
    conn: Arc<Mutex<SqliteConnection>>,
}
```

### 查询优化
- 使用 `into_boxed()` 构建复杂查询
- 支持分页查询 (`limit`/`offset`)
- 批量操作支持

## 错误处理

Diesel提供了类型安全的错误处理：

```rust
use diesel::result::Error as DieselError;

pub fn create_event(&self, event_data: &NewEvent) -> Result<i32, DieselError> {
    // 操作失败时会返回具体的错误类型
    diesel::insert_into(events)
        .values(event_data)
        .execute(conn)?;
    
    Ok(inserted_id)
}
```

## 迁移管理

### 创建新迁移
```bash
diesel migration generate add_user_table
```

### 迁移文件结构
```
migrations/
├── 2024_01_01_000001_create_events_table/
│   ├── up.sql      # 升级脚本
│   └── down.sql    # 回滚脚本
└── 2024_01_02_000002_add_user_table/
    ├── up.sql
    └── down.sql
```

### 自动迁移
```rust
// 应用启动时自动运行迁移
embed_migrations!();
embedded_migrations::run(&conn)?;
```

## 可用的命令

### 基础CRUD操作
- `create_event` - 创建事件
- `get_all_events` - 获取所有事件
- `get_event_by_id` - 根据ID获取事件
- `update_event` - 更新事件
- `delete_event` - 硬删除事件
- `soft_delete_event` - 软删除事件

### 查询操作
- `get_events_by_date_range` - 时间范围查询
- `get_events_by_date` - 指定日期查询
- `search_events` - 搜索事件
- `get_recent_events` - 获取最近事件
- `get_upcoming_events` - 获取即将到来的事件
- `get_events_with_filter` - 使用过滤器查询

### 统计和清理
- `get_event_stats` - 获取事件统计
- `cleanup_deleted_events` - 清理已删除事件

## 推荐方案

对于企业级应用，推荐使用 **Diesel ORM**：

✅ **优势**
- 成熟稳定，社区活跃
- 类型安全，编译时检查
- 性能优秀
- 文档完善

✅ **适用场景**
- 中小型应用
- 对性能要求较高
- 需要类型安全
- 团队熟悉Rust

如果需要异步支持或更现代的API，可以考虑 **SeaORM**。 