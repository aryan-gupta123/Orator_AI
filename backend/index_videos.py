"""
PRE-HACKATHON: Run this script to index videos in TwelveLabs
This MUST be done before the hackathon starts!
"""

import os
import asyncio
from dotenv import load_dotenv
from services.twelvelabs_service import TwelveLabsService

load_dotenv()

# Videos to index - CUSTOMIZE THESE
VIDEOS_TO_INDEX = [
    {
        "url": "https://www.youtube.com/watch?v=89iQAAxBBaQ",
        "title": "Chris Voss - Never Split the Difference",
        "category": "negotiation"
    },
    {
        "url": "https://www.youtube.com/watch?v=tG9xqyjPeL4",
        "title": "Senate AI Regulation Hearing 2024",
        "category": "ai_debate"
    },
    {
        "url": "https://www.youtube.com/watch?v=eOuzXVQx4oE",
        "title": "Tech CEOs on Remote Work",
        "category": "wfh_debate"
    },
    {
        "url": "https://www.youtube.com/watch?v=hgGp8jRnM-Q",
        "title": "Gordon Ramsay Pizza Review",
        "category": "pizza_debate"
    },
    {
        "url": "https://www.youtube.com/watch?v=vjEOyLUv-Wo",
        "title": "Real Salary Negotiation Examples",
        "category": "negotiation"
    },
]

async def index_all_videos():
    """Index all videos for the hackathon"""
    
    service = TwelveLabsService()
    
    print("🎬 Starting video indexing...")
    print(f"📊 Total videos to index: {len(VIDEOS_TO_INDEX)}")
    print("")
    
    indexed = []
    failed = []
    
    for i, video in enumerate(VIDEOS_TO_INDEX, 1):
        print(f"[{i}/{len(VIDEOS_TO_INDEX)}] Indexing: {video['title']}")
        
        try:
            video_id = await service.index_video(
                video_url=video["url"],
                video_title=video["title"]
            )
            
            if video_id:
                indexed.append({
                    "title": video["title"],
                    "video_id": video_id,
                    "category": video["category"]
                })
                print(f"   ✅ Success! Video ID: {video_id}")
            else:
                failed.append(video["title"])
                print(f"   ❌ Failed to index")
                
        except Exception as e:
            failed.append(video["title"])
            print(f"   ❌ Error: {e}")
        
        print("")
    
    # Summary
    print("=" * 50)
    print("📊 INDEXING SUMMARY")
    print("=" * 50)
    print(f"✅ Successfully indexed: {len(indexed)}")
    print(f"❌ Failed: {len(failed)}")
    print("")
    
    if indexed:
        print("Indexed Videos:")
        for video in indexed:
            print(f"  • {video['title']}")
            print(f"    ID: {video['video_id']}")
            print(f"    Category: {video['category']}")
            print("")
    
    if failed:
        print("Failed Videos:")
        for title in failed:
            print(f"  • {title}")
    
    print("=" * 50)
    print("🎉 Pre-hackathon setup complete!")
    print("💡 Tip: Save these video IDs - you might need them for demo")

if __name__ == "__main__":
    # First, create the index
    print("🔧 Step 1: Create TwelveLabs Index")
    print("   1. Go to https://playground.twelvelabs.io/")
    print("   2. Create a new index with model:")
    print("      - Marengo 3.0 (recommended) or Pegasus 1.2")
    print("      - Both include Visual + Audio automatically")
    print("   3. Copy the Index ID and add it to your .env file")
    print("")
    
    input("Press Enter when you've created the index and updated .env...")
    
    # Check if index ID exists
    load_dotenv()
    index_id = os.getenv("TWELVELABS_INDEX_ID")
    
    if not index_id or index_id == "your_index_id_here":
        print("❌ Error: TWELVELABS_INDEX_ID not set in .env")
        print("   Please add your index ID and run again")
        exit(1)
    
    print(f"✅ Using Index ID: {index_id}")
    print("")
    
    # Run indexing
    asyncio.run(index_all_videos())