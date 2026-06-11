import os

filepath = r"c:\Users\HP\OneDrive\Documents\Desktop\Haatza WareHouse\WareHouse\src\pages\ManagePreview\ManagePreviewPage.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Find the last occurrence of setMatsConfig (which is in the form)
idx = content.rfind("setMatsConfig")
if idx == -1:
    print("Error: setMatsConfig not found")
    exit(1)

# Find the opening <div className="cms-form-grid-2col"> before it
form_start = content.rfind('<div className="cms-form-grid-2col">', 0, idx)
if form_start == -1:
    print("Error: opening div not found")
    exit(1)

# Now find the matching closing </div>
div_depth = 0
form_end = -1
for i in range(form_start, len(content)):
    if content[i:i+4] == "<div":
        div_depth += 1
    elif content[i:i+5] == "</div":
        div_depth -= 1
        if div_depth == 0:
            form_end = i + 6  # Include the </div>
            break

if form_end == -1:
    print("Error: closing div not found")
    exit(1)

print("Found block to replace:")
print(content[form_start:form_end])

new_form_content = """<div className="cms-form-grid-2col">
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Display Name *</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.productName} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].productName = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Brand Name</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.brand || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].brand = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Price *</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.price} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].price = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Original Price (Strikeout)</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.oldPrice || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].oldPrice = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Discount Badge (e.g. 65% OFF)</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.discount || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].discount = e.target.value;
                                                                             updated.items[idx].offer = e.target.value; // Sync offer tag
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Quantity (e.g. 1 pc)</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.quantity || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].quantity = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap" style={{ gridColumn: 'span 2' }}>
                                                                     <label className="form-field-label">Delivery Time (e.g. 8 mins)</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.delivery || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].delivery = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                             </div>"""

new_content = content[:form_start] + new_form_content + content[form_end:]
with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("SUCCESS")
