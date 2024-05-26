# image.rb
require 'sinatra'
require 'rmagick'
require 'json'
require 'rack/cors'

# Allow all origins for all routes
use Rack::Cors do
  allow do
    origins '*'  # Allow requests from any origin
    resource '*', headers: :any, methods: [:get, :post, :options]  # Allow all resources with any headers and methods
  end
end

def process_image(image_path)
  image = Magick::Image.read(image_path).first
  dimension = 128

  # Check if the image is exactly 128*128 pixels
  unless image.rows == dimension && image.columns == dimension
    puts "Image #{image_path} is not exactly #{dimension}x#{dimension}. This image will be skipped."
    return nil
  end

  # Rotate image 90 degrees clockwise and flip horizontally
  image = image.rotate(-90).flip

  rows = []

  0.step(image.rows - 1, 4) do |i|
    cols = []
    0.step(image.columns - 1, 4) do |j|
      pixel = image.pixel_color(i + 2, j + 2)

      intensity = pixel.intensity
      cols << case intensity
              when 0..5910 then 0
              when 5910..26213 then 1
              else 2
              end
    end
    rows << cols
  end

  rows
end

post '/upload' do
  content_type :json

  # Handle file upload
  if params[:image] && params[:image][:tempfile]
    tempfile = params[:image][:tempfile]
    result = process_image(tempfile.path)
    if result
      { status: 'success', data: result }.to_json
    else
      { status: 'error', message: 'Invalid image or image dimensions' }.to_json
    end
  else
    { status: 'error', message: 'No file uploaded' }.to_json
  end
end

options '*' do
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
  response.headers['Access-Control-Allow-Origin'] = '*'
  200
end

# Start the server
# To run: ruby image.rb
