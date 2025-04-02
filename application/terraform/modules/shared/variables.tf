variable "raw_documents_bucket_name" {
  type = string
}

variable "raw_documents_bucket_cors_origin" {
  type = list(string)
}

variable "raw_documents_bucket_force_destroy" {
  type = bool
}
