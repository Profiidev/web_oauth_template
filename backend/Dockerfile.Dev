FROM rust:latest 
RUN rustup default stable
RUN rustup update

RUN cargo install cargo-watch

RUN rustup target add x86_64-unknown-linux-musl
RUN apt-get update && apt-get install -y tini cmake

WORKDIR /app