terraform {
  backend "s3" {
    bucket = "george-richardson-tfstate"
    key    = "${local.site_name}"
    region = "eu-west-2"
  }
}

variable "branch" {
  type = "string"
}

locals {
  site_name = "${var.branch == "master" ? "gormpodcast.com" : "develop.gormpodcast.com"}"
}

provider "aws" {
  region = "eu-west-1"
}

provider "aws" {
  alias  = "useast1"
  region = "us-east-1"
}

module "static_site" {
  source = "git::https://github.com/george-richardson/terraform_s3_cloudfront_static_site.git?ref=1.1.0"

  providers {
    aws.useast1 = "aws.useast1"
  }

  name           = "${local.site_name}"
  hosted_zone_id = "Z3JAE0Z0155MJ8"
  region         = "eu-west-1"

  tags = {
    website = "${local.site_name}"
  }
}
