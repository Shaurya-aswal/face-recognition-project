from flask import Flask, request, jsonify
from flask_cors import CORS
import util

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20 MB limit
CORS(app)

@app.route('/classify_image', methods=['POST'])
def classify_image():
    try:
        image_data = request.json.get('image_data')  # ✅ expects JSON
        result = util.classify_image(image_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    print("Starting Python Flask Server For Sports Celebrity Image Classification")
    util.load_saved_artifacts()
    app.run(port=5000)
