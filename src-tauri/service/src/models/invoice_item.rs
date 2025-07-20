use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, PartialEq, FromQueryResult)]
pub struct SelectInvoicesItemsForUpdate {
    pub id: String,
    pub inventory_id: String,
    pub name: String,
    pub price: f64,
    pub quantity: f64,
    pub product_id: String,
}

#[derive(Deserialize, Serialize, Debug, PartialEq, FromQueryResult)]
pub struct SelectInvoicesItems {
    pub name: String,
    pub price: f64,
    pub quantity: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewInvoiceItem {
    pub price: f64,
    pub quantity: f64,
    pub product_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInvoiceItem {
    pub id: Option<String>,
    pub invoice_id: Option<String>,
    pub inventory_id: Option<String>,
    pub price: f64,
    pub quantity: f64,
    pub product_id: String,
}
