#!/bin/sh

# MinIO CLI 설정
mc alias set local http://localhost:9000 admin password

# 버킷 생성
mc mb local/uploads

# Public 정책 적용
mc anonymous set public local/uploads
