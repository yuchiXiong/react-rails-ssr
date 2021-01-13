# frozen_string_literal: true
require 'rails/generators/base'

module React

  module Generators
    class SsrGenerator < ::Rails::Generators::Base

      React::Generators::SsrGenerator.source_root(__dir__)

      def install_dependency
        say "add react-router to your app"
        run "yarn add react-router-dom"
      end

      def add_example_route
        copy_file "#{__dir__}/template/app/controllers/react_ssr_controller.rb", ::Rails.root.join('app', 'controllers', 'react_ssr_controller.rb')
        copy_file "#{__dir__}/template/app/views/react_ssr/index.html.erb", ::Rails.root.join('app', 'views', 'react_ssr', 'index.html.erb')
        route "root 'react_ssr#index'"
        route "get '/*other', to: 'react_ssr#index'"
      end

      def add_pack_tag
        app_root = ::Rails.root

        inject_into_file app_root.join('app', 'views', 'layouts', 'application.html.erb'), before: "</head>" do
          <<-'ERB'
    <%= stylesheet_pack_tag 'react_ssr', media: 'all', 'data-turbolinks-track': 'reload' %>
          ERB
        end

        inject_into_file app_root.join('app', 'views', 'layouts', 'application.html.erb'), after: "<body>" do
          <<-'ERB'

    <%= react_component 'app', { path: request.path }, { prerender: true } %>
          ERB
        end

        inject_into_file app_root.join('app', 'views', 'layouts', 'application.html.erb'), before: "</body>" do
          <<-'ERB'
  <%= javascript_pack_tag 'react_ssr', 'data-turbolinks-track': 'reload' %>
          ERB
        end
      end

      def add_pack_file
        copy_file "#{__dir__}/template/app/javascript/packs/react_ssr.js", ::Rails.root.join('app', 'javascript', 'packs', 'react_ssr.js')
        copy_file "#{__dir__}/template/app/javascript/packs/react_ssr.scss", ::Rails.root.join('app', 'javascript', 'packs', 'react_ssr.scss')
        gsub_file ::Rails.root.join('app', 'javascript', 'packs', 'server_rendering.js'), 'require.context("components", true)', 'require.context("src", true)'
        directory "#{__dir__}/template/app/javascript/src/", ::Rails.root.join('app', 'javascript', 'src')
      end

      def reload_loader
        app_root = ::Rails.root

        say "add isomorphic-style-loader to your app"
        run "yarn add -D isomorphic-style-loader"

        directory "#{__dir__}/template/loaders/", ::Rails.root.join('config', 'webpack', 'loaders')
        gsub_file app_root.join('config', 'webpack', 'environment.js'), "module.exports = environment" do
          <<-'JS'

const reloadStyleLoader = require('./loaders/isomorphic_style_loader');

module.exports = reloadStyleLoader(environment)
          JS
        end
      end

    end
  end
end