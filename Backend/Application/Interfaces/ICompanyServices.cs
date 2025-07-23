using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SahibGameStore.Application.DTOS.Companies;
using SahibGameStore.Application.ViewModels;

namespace SahibGameStore.Application.Interfaces
{
    public interface ICompanyServices
    {
        Task<IEnumerable<CompanyViewModel>> GetAllCompanies();
        Task<CompanyViewModel> GetCompanyById(Guid id);
        void InsertCompany(AddOrUpdateCompanyDTO company);
        void UpdateCompany(AddOrUpdateCompanyDTO company);
        void DeleteCompany(Guid id);
    }
}