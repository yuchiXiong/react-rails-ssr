$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "react/rails/ssr/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name = "react-rails-ssr"
  spec.version = React::Rails::Ssr::VERSION
  spec.authors = ["yuchiXiong"]
  spec.email = ["yuchi.xiong@foxmail.com"]
  spec.homepage = "https://github.com/yuchiXiong"
  spec.summary = "https://github.com/yuchiXiong"
  spec.description = "https://github.com/yuchiXiong"
  spec.license = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "https://github.com/yuchiXiong"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  spec.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  spec.add_dependency "rails", "~> 5.2.4", ">= 5.2.4.3"
  spec.add_dependency "webpacker"
  spec.add_dependency "react-rails"

  spec.add_development_dependency "sqlite3"
end
