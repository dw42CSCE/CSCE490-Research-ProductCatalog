var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("ReactApp");

app.MapPost("/api/quote", (QuoteRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.ProductName) ||
        request.Price < 0 ||
        request.Quantity < 1)
    {
        return Results.BadRequest("Enter a product name, valid price, and quantity.");
    }

    var subtotal = request.Price * request.Quantity;
    var discount = request.Quantity >= 10 ? subtotal * 0.10m : 0m;
    var discountedSubtotal = subtotal - discount;
    var tax = discountedSubtotal * 0.07m;
    var total = discountedSubtotal + tax;

    return Results.Ok(new
    {
        request.ProductName,
        request.Price,
        request.Quantity,
        Subtotal = subtotal,
        Discount = discount,
        Tax = tax,
        Total = total
    });
});

app.Run();

record QuoteRequest(string ProductName, decimal Price, int Quantity);