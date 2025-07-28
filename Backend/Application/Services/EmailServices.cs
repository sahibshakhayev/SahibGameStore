using Application.Interfaces;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Domain.Entities.Common;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Application.ViewModels;
using System.Security.Cryptography;
using System.Net.Mail;
using System.Net;

public class EmailServices:IEmailServices
{
    private readonly IConfiguration _configuration;
    private SmtpClient _smtpClient;
    

    public EmailServices(IConfiguration configuration)
    {
        
       _configuration = configuration;

        _smtpClient = new SmtpClient(_configuration["SMTP_Server"], Int32.Parse(_configuration["SMTP_Port"]))
        {
            EnableSsl = true,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(_configuration["SMTP_Username"], _configuration["SMTP_Password"])
        };

    }

    public async Task<object> SendEmailAsync(string email, string subject, string message)
    {
        var MailMessage = new MailMessage(from: "saha_ui43@itstep.edu.az",
                            to: email,
                            subject,
                            message);
        MailMessage.IsBodyHtml = true;

        try
        {
            await _smtpClient.SendMailAsync(MailMessage);
            return "OK";

        }

        catch (Exception ex)
        {
            throw new ApplicationException(message, ex);

        }

        
    }
}

 

