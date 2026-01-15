use axum::{
    routing::get,
    Router,
};
use tower_http::cors::CorsLayer;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // build our application with a route
    let app = Router::new()
        .route("/", get(|| async { "Hello from RetroGame Rust Backend!" }))
        .route("/api/status", get(|| async { 
            axum::Json(serde_json::json!({ "status": "ok", "message": "Backend is running" }))
        }))
        .layer(CorsLayer::permissive());

    // run it with hyper on localhost:4000
    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    println!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
