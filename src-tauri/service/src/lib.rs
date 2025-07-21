pub mod models;
pub mod queries;

mod mutations;
mod transactions;

mod entities {
    pub use entity::todos::{self, Entity as Todos};
    pub use entity::shortcuts::{self, Entity as Shortcuts};
}

pub use queries::*;

pub use sea_orm;
