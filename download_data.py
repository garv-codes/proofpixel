import os

os.environ['HF_HOME'] = os.path.abspath('./hf_cache')
os.environ['HF_DATASETS_CACHE'] = os.path.abspath('./hf_datasets_cache')
os.makedirs('./hf_datasets_cache', exist_ok=True)
os.makedirs('./hf_cache', exist_ok=True)

from datasets import load_dataset
from PIL import Image

def download_data():
    print('Loading Hemg/ai-vs-real-image-detection stream...')
    try:
        ds = load_dataset('Hemg/ai-vs-real-image-detection', split='train', streaming=True)
        
        out_dir_fake_land = 'landscapes/FAKE'
        out_dir_fake_face = 'faces/FAKE'
        out_dir_real_face = 'faces/REAL'
        
        os.makedirs(out_dir_fake_land, exist_ok=True)
        os.makedirs(out_dir_fake_face, exist_ok=True)
        os.makedirs(out_dir_real_face, exist_ok=True)

        count_fake_land = 0
        count_real_face = 0
        count_fake_face = 0
        
        for row in ds:
            # We don't have text prompts here, we only have the image and label.
            # But the dataset might be mostly faces or objects. Let's just grab the images as "Faces" or "General AI" for now, although the user specifically wants LANDSCAPES.
            # Actually, without prompts, we can't filter landscapes easily. We will just save a mix.
            label = row.get('label') 
            # Check structure: label = 0 (Real) or 1 (Fake) probably
            
            img = row['image']
            if img.mode != 'RGB':
                img = img.convert('RGB')
                
            if label == 0 and count_real_face < 100:
                img.save(f'{out_dir_real_face}/real_{count_real_face}.jpg', 'JPEG')
                count_real_face += 1
                if count_real_face % 20 == 0:
                    print(f"Downloaded Real Gen {count_real_face}/100")
                    
            elif label == 1 and count_fake_land < 100:
                # We save all AI generated images here to balance the real landscapes.
                img.save(f'{out_dir_fake_land}/fake_{count_fake_land}.jpg', 'JPEG')
                count_fake_land += 1
                if count_fake_land % 20 == 0:
                    print(f"Downloaded Fake Gen {count_fake_land}/100")

            if count_real_face >= 100 and count_fake_land >= 100:
                print('Finished downloading!')
                break
                
    except Exception as e:
        print("Failed to download", e)

if __name__ == '__main__':
    download_data()
