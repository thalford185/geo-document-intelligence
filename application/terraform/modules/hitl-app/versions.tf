terraform {
  required_version = "~> 1.11.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.13.0"
    }
    google = {
      version = "~> 6.25.0"
    }
  }
}
